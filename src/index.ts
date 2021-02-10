// import fs from 'fs';
// import path from 'path';
import { Plugin, OutputChunk, OutputAsset } from 'rollup';
import { merge } from 'lodash';
import { defaultConfig } from './config/config';
import { VIInjector } from './utils/injector';
import { VILogger } from './utils/logger';
import { VersionInjectorConfig } from './types/interfaces';

/**
 * Rollup.js plugin that will find and replace verion number and/or date in the source code
 * 	and add a comment at the top of a file with version number and/or date.
 * @param userConfig user configuration
 */
export default function versionInjector (userConfig?: Partial<VersionInjectorConfig>): Partial<Plugin> {
  const pluginName: string = 'version-injector';
  const config: VersionInjectorConfig = merge({}, defaultConfig, userConfig);
  const logger: VILogger = new VILogger(config.logLevel, config.logger);
  const injector: VIInjector = new VIInjector(logger);
  const version: string = injector.getVersion(config.packageJson);
  return {
    name: pluginName,
    renderChunk (code: string, chunk: OutputChunk | OutputAsset) {
      logger.debug('chunk', chunk);
      logger.info(`${pluginName} started with version "${version}"`);
      logger.debug('config', config);
      const fileName = chunk.fileName;
      if (config.exclude.includes(fileName)) {
        logger.info('file was in the exclude list - skipping', fileName);
        return;
      }
      if (chunk.type === 'asset') {
        logger.info('output bundle was an asset - skipping', fileName);
        return;
      }
      injector.setCode(code);
      injector.injectIntoTags(config.injectInTags, fileName, version);
      injector.injectIntoComments(config.injectInComments, fileName, version);
      if (injector.isCodeChanged()) {
        logger.info(`${pluginName} finished`);
        return { code: injector.getCode(), map: null };
      } else {
        logger.info(`file was not changed. did not write to file "${fileName}"`);
      }

    }
  } as Partial<Plugin>;
}
