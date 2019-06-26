import fs from 'fs';
import path from 'path';
import { defaultConfig } from './config/config';
import { OutputBundle, OutputOptions, Plugin, OutputChunk } from 'rollup';
import { VIUtils } from './utils/utils';
import { VILogger } from './utils/logger';
import { VersionInjectorConfig, SupportedFileExtensions } from './types/interfaces';

/**
 * Rollup.js plugin that will find and replace verion number and/or date in the source code
 * 	and add a comment at the top of a file with version number and/or date.
 * @param userConfig user configuration
 */
export default function versionInjector (userConfig?: Partial<VersionInjectorConfig>): Partial<Plugin> {
  const pluginName: string = 'version-injector';
  const config: VersionInjectorConfig = Object.assign(defaultConfig, userConfig);
  const logger: VILogger = new VILogger(config.logLevel, config.logger);
  const utils: VIUtils = new VIUtils(logger);

  let outputOptions: OutputOptions;
  let version: string;

  return {
    name: pluginName,
    generateBundle (outOpts: OutputOptions) {
      /* save options for writeBundle later */
      outputOptions = outOpts;
    },
    writeBundle (outputBundle: OutputBundle) {
      version = utils.getVersion(config.packageJson);
      logger.log(`${pluginName} started with version "${version}"`);
      logger.debug('config', config);

      /* skip if no file was output */
      const outputFile = outputOptions.file;
      if (!outputFile) {
        logger.warn('no output file for outputOptions - skipping', outputOptions);
        return;
      }

      logger.debug('output file', outputFile);

      /* skip if the filename is in the excludes list */
      const fileName = Object.keys(outputBundle)[0];
      if (config.exclude.includes(fileName)) {
        logger.info('file was in the exclude list - skipping', fileName);
        return;
      }

      logger.debug('file name', fileName);

      /* skip if the output bundle doesn't exist or if it is an assest */
      const tmpBundle = outputBundle[fileName];
      if (!tmpBundle || tmpBundle['isAsset']) {
        logger.info('output bundle did not exist or was an asset - skipping', tmpBundle);
        return;
      }

      /* get the bundle */
      const bundle: OutputChunk = tmpBundle as OutputChunk;
      let code = bundle.code;
      let fileChanged = false;

      /* check if it should inject in the comments */
      if (config.injectInTags && config.injectInTags.fileRegexp.test(fileName)) {
        let results = utils.injectIntoTags(
          config.injectInTags.tagId,
          config.injectInTags.dateFormat,
          version,
          code
        );

        /* if it made changes */
        if (results.replaceCount) {
          fileChanged = true;
          code = results.code;
          logger.log(`found and replaced [${results.replaceCount}] version tags in`, fileName);
        } else {
          logger.info(`no tags found in file: "${fileName}"`);
        }
      } else {
        logger.debug('injectInTages skipped because it was set to "false" or fileName did not match expression', config.injectInTags);
      }

      /* check if it should inject in the comments */
      if (config.injectInComments && config.injectInComments.fileRegexp.test(fileName)) {
        let fileExt: SupportedFileExtensions | null = utils.getFileExtension(fileName);

        if (fileExt) {
          fileChanged = true;
          code = utils.injectIntoComments(
            config.injectInComments.tag,
            config.injectInComments.dateFormat,
            version,
            fileExt,
            code
          );
          logger.info(`injected version as comment`);
        } else {
          logger.warn(`file extension not supported for injecting into comments "${fileExt}"`);
        }
      } else {
        logger.debug('injectInComments skipped because it was set to "false" or fileName did not match expression', config.injectInComments);
      }

      if (fileChanged) {
        logger.debug('file was changed, attempting to write new file');
        const finalFile = path.resolve(process.cwd(), outputFile);
        fs.writeFileSync(finalFile, code);
        logger.log(`write successful. injected version into file: ${finalFile}`);
      } else {
        logger.log(`file was not changed. did not write to file "${fileName}"`);
      }

      logger.log(`${pluginName} finished`);
    }
  } as Partial<Plugin>;
}
