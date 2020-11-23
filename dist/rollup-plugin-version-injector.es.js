import { merge } from 'lodash';
import fs from 'fs';
import path from 'path';
import dateformat from 'dateformat';
import chalk from 'chalk';

const defaultConfig = {
    injectInComments: {
        fileRegexp: /\.(js|html|css)$/,
        tag: 'Version: {version} - {date}',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
    },
    injectInTags: {
        fileRegexp: /\.(js|html|css)$/,
        tagId: 'VI',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
    },
    packageJson: './package.json',
    logLevel: 'info',
    logger: console,
    exclude: []
};

class VIInjector {
    constructor(logger) {
        this.logger = logger;
        this.codeChanged = false;
        this.code = '';
    }
    getVersion(packagePath) {
        const packageFile = JSON.parse(fs.readFileSync(path.resolve(packagePath), 'utf8'));
        this.logger.debug(`retrieved package.json path "${packagePath}" and version "${packageFile.version}"`);
        return packageFile.version;
    }
    setCode(code) {
        this.code = code;
        this.codeChanged = false;
    }
    isCodeChanged() {
        return this.codeChanged;
    }
    writeToFile(outputFile) {
        const finalFile = path.resolve(process.cwd(), outputFile);
        fs.writeFileSync(finalFile, this.code);
        this.logger.log(`wrote to file: "${finalFile}"`);
    }
    getFileExtension(fileName) {
        let len = fileName.length;
        let ext = null;
        if (fileName.substring(len - 2) === 'js') {
            ext = 'js';
        }
        if (fileName.substring(len - 4) === 'html') {
            ext = 'html';
        }
        if (fileName.substring(len - 3) === 'css') {
            ext = 'css';
        }
        this.logger.debug(`retrieved file extension "${ext}" for file "${fileName}"`);
        return ext;
    }
    injectIntoTags(config, fileName, version) {
        if (!this.code) {
            this.logger.error('code not set in VIInjector called from injectIntoTags()');
        }
        if (config && config.fileRegexp.test(fileName)) {
            let results = this.replaceVersionInTags(config.tagId, config.dateFormat, version, this.code);
            if (results.replaceCount) {
                this.logger.log(`found and replaced [${results.replaceCount}] version tags in`, fileName);
                this.codeChanged = true;
                this.code = results.code;
            }
            else {
                this.logger.info(`no tags found in file: "${fileName}"`);
            }
        }
        else {
            this.logger.debug('injectInTages skipped because it was set to "false" or fileName did not match expression', config);
        }
    }
    injectIntoComments(config, fileName, version) {
        if (!this.code) {
            this.logger.error('code not set in VIInjector called from injectIntoComments()');
        }
        if (config && config.fileRegexp.test(fileName)) {
            let fileExt = this.getFileExtension(fileName);
            if (fileExt) {
                this.code = this.replaceVersionInComments(config.tag, config.dateFormat, version, fileExt, this.code);
                this.codeChanged = true;
                this.logger.info(`injected version as comment`);
            }
            else {
                this.logger.warn(`file extension not supported for injecting into comments "${fileExt}"`);
            }
        }
        else {
            this.logger.debug('injectIntoComments skipped because it was set to "false" or fileName did not match expression', config);
        }
    }
    replaceVersionInTags(tagId, dateFormat, version, code) {
        this.logger.debug(`starting injectIntoTags() with args: { tagId: "${tagId}", dateFormat: ${dateFormat}, version: ${version}, code: "${code ? code.substring(0, 12) + '...' : code}" }`);
        let replaceCount = 0;
        const pattern = this.buildTagRegexp(tagId);
        let match = pattern.exec(code);
        while (match) {
            replaceCount++;
            this.logger.debug(`match #${replaceCount}: "${match[0]}"`);
            let start = match.index;
            let end = start + match[0].length;
            let replacement = this.stripTags(match[0], tagId);
            replacement = this.replaceVersion(replacement, version);
            replacement = this.replaceDate(replacement, dateFormat);
            this.logger.debug(`match #${replaceCount} replacement: "${replacement}"`);
            code = code.substring(0, start) + replacement + code.substring(end);
            match = pattern.exec(code);
        }
        this.logger.debug(`finished injectIntoTags() and replaced ${replaceCount} tags`);
        return { code, replaceCount };
    }
    replaceVersionInComments(tag, dateFormat, version, fileExtension, code) {
        this.logger.debug(`starting injectIntoComments() with args: { tag: "${tag}", dateFormat: "${dateFormat}", version: "${version}", fileExtension: "${fileExtension}", code: "${code ? code.substring(0, 12) + '...' : code}" }`);
        let injectValue = this.replaceVersion(tag, version);
        injectValue = this.replaceDate(injectValue, dateFormat);
        let versionTag = '';
        switch (fileExtension) {
            case 'js':
                versionTag = `// ${injectValue}`;
                break;
            case 'html':
                versionTag = `<!-- ${injectValue} -->`;
                break;
            case 'css':
                versionTag = `/* ${injectValue} */`;
                break;
        }
        if (versionTag) {
            this.logger.debug(`injecting "${versionTag}" into the passed in code as a comment`);
            code = versionTag + '\n' + code;
        }
        else {
            this.logger.warn(`did not inject "${versionTag}" into the passed in code as a comment - unsupported file extension`);
        }
        this.logger.debug('finished injectIntoComments()');
        return code;
    }
    stripTags(tag, tagId) {
        const regexp = new RegExp(`(\\[${tagId}]|\\[\\/${tagId}])`, 'g');
        this.logger.debug(`tag before stripping tagId`, tag);
        const newTag = tag.replace(regexp, '');
        this.logger.debug(`tag after stripping tagId`, newTag);
        return newTag;
    }
    buildTagRegexp(tagId) {
        let regexp = new RegExp(`(\\[${tagId}\\])(.*)(\\[\\/${tagId}\\])`, 'g');
        this.logger.debug('generated RegExp', regexp);
        return regexp;
    }
    replaceVersion(tag, version) {
        this.logger.debug(`tag before replacing version: "${tag}"`);
        let newTag = tag.replace('{version}', version);
        if (newTag === tag) {
            this.logger.debug(`could not find "{version}" placeholder in tag: "${tag}"`);
        }
        this.logger.debug(`tag after replacing version: "${newTag}"`);
        return newTag;
    }
    replaceDate(tag, dateFormat) {
        this.logger.debug(`tag before replacing date: "${tag}"`);
        let newTag = tag.replace('{date}', dateformat(dateFormat));
        if (newTag === tag) {
            this.logger.debug(`could not find "{date}" placeholder in tag: "${tag}"`);
        }
        this.logger.debug(`tag after replacing date: "${newTag}"`);
        return newTag;
    }
}

class VILogger {
    constructor(logLevel, logger = console) {
        this.DEFAULT_LOG_LEVEL = 3;
        this._logger = logger;
        this.internalLog = [];
        this.logMap = this.buildMap();
        let level = this.logMap.get(logLevel);
        if (level) {
            this.debug(`setting logging level to "${logLevel}"`);
        }
        else {
            level = this.DEFAULT_LOG_LEVEL;
            this.warn(`log level passed in was invalid ("${logLevel}"). setting log level to default ("warn")`);
        }
        this.logLevel = level;
    }
    log(...args) {
        this.logger('log', ...args);
    }
    debug(...args) {
        this.logger('debug', ...args);
    }
    info(...args) {
        this.logger('info', ...args);
    }
    warn(...args) {
        this.logger('warn', ...args);
    }
    error(...args) {
        this.logger('error', ...args);
    }
    logger(level, ...args) {
        if ((this.logMap.get(level) || this.DEFAULT_LOG_LEVEL) >= this.logLevel) {
            this._logger[level](chalk.magenta.bold('  [VI]'), chalk.yellow(`[${level.padEnd(5)}]`), ...args);
        }
        this.internalLog.push({ level, log: args });
    }
    buildMap() {
        const map = new Map();
        map.set('debug', 1);
        map.set('info', 2);
        map.set('warn', 3);
        map.set('error', 4);
        map.set('log', 5);
        return map;
    }
}

function versionInjector(userConfig) {
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
                if (!tmpBundle || tmpBundle.type === 'asset') {
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

export default versionInjector;
