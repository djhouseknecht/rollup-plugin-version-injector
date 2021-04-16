import fs from 'fs';
import path from 'path';
import dateformat from 'dateformat';

import { ILogger, SupportedFileExtensions, InjectInTagsConfig, InjectInCommentsConfig } from '../types/interfaces';

/**
 * Utilities for version-injector
 */
export class VIInjector {

  private logger: ILogger;
  private codeChanged: boolean;
  private code: string;

  /**
   * Construct utilities and pass in the desired logger
   * @param logger desired logger
   */
  constructor (logger: ILogger) {
    this.logger = logger;
    this.codeChanged = false;
    this.code = '';
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
   * Set the class' code to work against
   * @param code code
   */
  public setCode (code: string): void {
    this.code = code;
    this.codeChanged = false;
  }

  /**
   * Determine if the code has changed
   */
  public isCodeChanged (): boolean {
    return this.codeChanged;
  }

  public getCode (): string {
    return this.code;
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
   * Search the class' code and inject version and/or date into
   *  the configured tags.
   * @param config inject in tags config
   * @param fileName filename of file (to validate file against configured fileRegexp)
   * @param version version to inject
   */
  public injectIntoTags (config: InjectInTagsConfig | false | undefined, fileName: string, version: string): void {
    if (!this.code) {
      this.logger.error('code not set in VIInjector called from injectIntoTags()');
    }
    /* check if it should inject in the comments */
    if (config && config.fileRegexp.test(fileName)) {
      let results = this.replaceVersionInTags(
        config.tagId,
        config.dateFormat,
        version,
        this.code
      );

      /* if it made changes */
      if (results.replaceCount) {
        this.logger.info(`found and replaced [${results.replaceCount}] version tags in`, fileName);
        this.codeChanged = true;
        this.code = results.code;
      } else {
        this.logger.info(`no tags found in file: "${fileName}"`);
      }
    } else {
      this.logger.debug('injectInTages skipped because it was set to "false" or fileName did not match expression', config);
    }
  }

  /**
   * Insert a comment into the beginning of a file
   * @param config inject in comments config
   * @param fileName filename of file (to validate file against configured fileRegexp and file extension)
   * @param version version to inject
   */
  public injectIntoComments (config: InjectInCommentsConfig | false | undefined, fileName: string, version: string): void {
    if (!this.code) {
      this.logger.error('code not set in VIInjector called from injectIntoComments()');
    }
    /* check if it should inject in the comments */
    if (config && config.fileRegexp.test(fileName)) {
      let fileExt: SupportedFileExtensions | null = this.getFileExtension(fileName);

      if (fileExt) {
        this.code = this.replaceVersionInComments(
          config.tag,
          config.dateFormat,
          version,
          fileExt,
          this.code
        );
        this.codeChanged = true;
        this.logger.info('injected version as comment in', fileName);
      } else {
        this.logger.warn(`file extension not supported for injecting into comments "${fileExt}"`);
      }
    } else {
      this.logger.debug('injectIntoComments skipped because it was set to "false" or fileName did not match expression', config);
    }
  }

  /**
   * Inject the version number and/or date into the passed in code. Version
   * 	and/or date must be within the opening (`[${tagId}]`) and closing (`[/${tagId}]`) tags.
   * @param tagId tag id to look for
   * @param dateFormat date format of today's date to be injected
   * @param version verions to be injected
   * @param code code to inject into
   */
  private replaceVersionInTags (tagId: string, dateFormat: string, version: string, code: string): { code: string, replaceCount: number } {
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
  private replaceVersionInComments (tag: string, dateFormat: string, version: string, fileExtension: SupportedFileExtensions, code: string): string {
    this.logger.debug(`starting injectIntoComments() with args: { tag: "${tag}", dateFormat: "${dateFormat}", version: "${version}", fileExtension: "${fileExtension}", code: "${code ? code.substring(0, 12) + '...' : code}" }`);
    let injectValue = this.replaceVersion(tag, version);
    injectValue = this.replaceDate(injectValue, dateFormat);
    let versionTag: string = '';
    switch (fileExtension) {
      case 'html':
        versionTag = `<!-- ${injectValue} -->`;
        break;
      case 'js':
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
