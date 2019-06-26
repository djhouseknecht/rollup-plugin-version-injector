import fs from 'fs';
import path from 'path';
import dateformat from 'dateformat';
import { ILogger, SupportedFileExtensions } from '../types/interfaces';

/**
 * Utilities for version-injector
 */
export class VIUtils {

  private logger: ILogger;

	/**
	 * Construct utilities and pass in the desired logger
	 * @param logger desired logger
	 */
  constructor (logger: ILogger) {
    this.logger = logger;
  }

	/**
	 * Return the version number from `package.json`
	 * @param packagePath path to `package.json`
	 */
  public getVersion (packagePath: string): string {
    const packageFile = JSON.parse(
      fs.readFileSync(path.resolve(packagePath), 'utf8')
    );
    this.logger.debug(`retrieved package.json path "${packagePath}" and version "${packageFile.version}"`);
    return packageFile.version;
  }

	/**
	 * Determine if the file extension is in the {@link SupportedFileExtensions}
	 * @param fileName file name
	 */
  public getFileExtension (fileName: string): SupportedFileExtensions | null {
    let len: number = fileName.length;
    let ext: SupportedFileExtensions | null = null;
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

	/**
	 * Inject the version number and/or date into the passed in code. Version
	 * 	and/or date must be within the opening (`[${tagId}]`) and closing (`[/${tagId}]`) tags.
	 * @param tagId tag id to look for
	 * @param dateFormat date format of today's date to be injected
	 * @param version verions to be injecte3d
	 * @param code code to inject into
	 */
  public injectIntoTags (tagId: string, dateFormat: string, version: string, code: string): { code: string, replaceCount: number } {
    this.logger.debug(`starting injectIntoTags() with args: { tagId: "${tagId}", dateFormat: ${dateFormat}, version: ${version}, code: "${code ? code.substring(0, 12) + '...' : code}" }`);
    let replaceCount: number = 0;
    const pattern = this.buildTagRegexp(tagId);

    let match: RegExpExecArray | null = pattern.exec(code);
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

	/**
	 * Inject the version number and/or date into the passed in tag.
	 *  File extension must be in the {@link SupportedFileExtensions} type.
	 * 	Extension is used to determin type of comment.
	 * @param tag to look in
	 * @param dateFormat date format of today's date to be injected
	 * @param version verions to be injecte3d
	 * @param fileType file type
	 * @param code code to inject into
	 */
  public injectIntoComments (tag: string, dateFormat: string, version: string, fileExtension: SupportedFileExtensions, code: string): string {
    this.logger.debug(`starting injectIntoComments() with args: { tag: "${tag}", dateFormat: "${dateFormat}", version: "${version}", fileExtension: "${fileExtension}", code: "${code ? code.substring(0, 12) + '...' : code}" }`);
    let injectValue = this.replaceVersion(tag, version);
    injectValue = this.replaceDate(injectValue, dateFormat);
    let versionTag: string = '';
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
    } else {
      this.logger.warn(`did not inject "${versionTag}" into the passed in code as a comment - unsupported file extension`);
    }

    this.logger.debug('finished injectIntoComments()');
    return code;
  }

	/**
	 * Remove the tagId from the passed in tag. Tags are wrapped in brackets `[]`
	 * 	It will remove `[${tagId}]` and `[/${tagId}]`
	 * @param tag tag string
	 * @param tagId tag id that should be stripped
	 */
  private stripTags (tag: string, tagId: string): string {
    const regexp = new RegExp(`(\\[${tagId}]|\\[\\/${tagId}])`, 'g');
    this.logger.debug(`tag before stripping tagId`, tag);
    const newTag = tag.replace(regexp, '');
    this.logger.debug(`tag after stripping tagId`, newTag);
    return newTag;
  }

  /**
   * Build a RegExp with the passed in tag id. Tags are wrapped in brackets `[]`
   * 	It will make a RegExp looking for `[${tagId}] *any character(s)* [/${tagId}]`
   * @param tagId tag id
   */
  private buildTagRegexp (tagId: string): RegExp {
    let regexp = new RegExp(`(\\[${tagId}\\])(.*)(\\[\\/${tagId}\\])`, 'g');
    this.logger.debug('generated RegExp', regexp);
    return regexp;
    // return new RegExp(`(\\[${tagId}])(([a-zA-Z{} ,:;!()_@\\-"'\\\\\\/\\d])+)(\\[\\/${tagId}])`, 'g');
  }

	/**
	 * Replace `{version}` with the version passed in
	 * @param tag tag string
	 * @param version version number passed in
	 */
  private replaceVersion (tag: string, version: string): string {
    this.logger.debug(`tag before replacing version: "${tag}"`);
    let newTag = tag.replace('{version}', version);
    if (newTag === tag) {
      this.logger.debug(`could not find "{version}" placeholder in tag: "${tag}"`);
    }
    this.logger.debug(`tag after replacing version: "${newTag}"`);
    return newTag;
  }

	/**
	 * Replace `{date}` with the current date in the passed in format.
	 * 	See [dateformat](https://www.npmjs.com/package/dateformat) for supported formats
	 * @param tag tag string
	 * @param version version number passed in
	 */
  private replaceDate (tag: string, dateFormat: string): string {
    this.logger.debug(`tag before replacing date: "${tag}"`);
    let newTag = tag.replace('{date}', dateformat(dateFormat));
    if (newTag === tag) {
      this.logger.debug(`could not find "{date}" placeholder in tag: "${tag}"`);
    }
    this.logger.debug(`tag after replacing date: "${newTag}"`);
    return newTag;
  }

}
