import fs from 'fs';
import path from 'path';
import dateformat from 'dateformat';
export class VIInjector {
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
//# sourceMappingURL=injector.js.map