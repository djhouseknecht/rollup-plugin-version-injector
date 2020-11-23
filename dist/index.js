import { merge } from 'lodash';
import { defaultConfig } from './config/config';
import { VIInjector } from './utils/injector';
import { VILogger } from './utils/logger';
export default function versionInjector(userConfig) {
    const pluginName = 'version-injector';
    const config = merge({}, defaultConfig, userConfig);
    const logger = new VILogger(config.logLevel, config.logger);
    const injector = new VIInjector(logger);
    let version;
    return {
        name: pluginName,
        writeBundle(outputBundle, bundle) {
            version = injector.getVersion(config.packageJson);
            logger.log(`${pluginName} started with version "${version}"`);
            logger.debug('config', config);
            const outputFiles = Object.keys(bundle);
            outputFiles.forEach((id) => {
                const chunk = bundle[id];
                const outputFile = chunk.fileName;
                if (!outputFile) {
                    logger.warn('no fileName found - skipping', chunk);
                    return;
                }
                logger.debug('output file', outputFile);
                const fileName = chunk.fileName;
                if (config.exclude.includes(fileName)) {
                    logger.info('file was in the exclude list - skipping', fileName);
                    return;
                }
                logger.debug('file name', fileName);
                const tmpBundle = chunk;
                if (!tmpBundle || tmpBundle['isAsset']) {
                    logger.info('output bundle did not exist or was an asset - skipping', fileName);
                    return;
                }
                let code = tmpBundle.code;
                injector.setCode(code);
                injector.injectIntoTags(config.injectInTags, fileName, version);
                injector.injectIntoComments(config.injectInComments, fileName, version);
                if (injector.isCodeChanged()) {
                    injector.writeToFile(`${outputBundle.dir}/${outputFile}`);
                }
                else {
                    logger.log(`file was not changed. did not write to file "${fileName}"`);
                }
            });
            logger.log(`${pluginName} finished`);
        }
    };
}
//# sourceMappingURL=index.js.map