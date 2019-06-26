import fs from 'fs';
import dateformat from 'dateformat';
import { VIUtils } from '../../../src/utils/utils';
import { ILogger } from '../../../dist/utils/logger';
import { SupportedFileExtensions } from '../../../dist/config/config';

describe('VIUtils | public methods', () => {
  let utils: VIUtils;
  let logger: ILogger;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    utils = new VIUtils(logger);
  });

  describe('getVersion()', () => {
    test('should return the version from package.json', () => {
      const packageJson = "{\"name\":\"something-cool\",\"version\":\"100.2.55\"}";
      const spy = jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => packageJson);
      const result = utils.getVersion('./path/package.json');
      expect(result).toEqual('100.2.55');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getFileExtension()', () => {
    test('should return js for .js files', () => {
      const file = '/project/index.js';
      expect(utils.getFileExtension(file)).toBe('js');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return js for .cjs files', () => {
      const file = '/project/index.cjs';
      expect(utils.getFileExtension(file)).toBe('js');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return html for .html files', () => {
      const file = '/project/index.html';
      expect(utils.getFileExtension(file)).toBe('html');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return css for .css files', () => {
      const file = '/project/styles.css';
      expect(utils.getFileExtension(file)).toBe('css');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
  });


  describe('injectIntoTags()', () => {
    test('should replace one occurrance of the found tagId', () => {
      const code = `{
        version: '[VI]{version} - {date}[/VI]',
        appName: 'some cool app'
      }`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const expectedCode = `{
        version: '7.1.1 - ${dateformat(dateFormat)}',
        appName: 'some cool app'
      }`;

      const results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code: expectedCode, replaceCount: 1 });
      expect(logger.debug).toHaveBeenCalledTimes(11);
    });

    test('should replace multiple occurrances of the found tagId', () => {
      const code = `<div>
        <span>[VI]{version} - {date}[/VI]</span>
        <span>[VI]Vesion: {version} & Date: {date}[/VI]</span>
      </div>`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const expectedCode = `<div>
        <span>7.1.1 - ${dateformat(dateFormat)}</span>
        <span>Vesion: 7.1.1 & Date: ${dateformat(dateFormat)}</span>
      </div>`;
      const results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code: expectedCode, replaceCount: 2 });
      expect(logger.debug).toHaveBeenCalledTimes(19);
    });

    test('should replace nothing if proper tag is not found', () => {
      const code = `function getVersion() {
        return '[VI] incorrect tags for {version}[VI]'
      }`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';

      const results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code, replaceCount: 0 });
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });

    test('should replace nothing if tags span across new lines', () => {
      const code = `<div>
        <span>[VI]{version} -
          {date}[/VI]</span>
      </div>`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';

      const results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code, replaceCount: 0 });
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

  describe('injectIntoComments()', () => {
    test('should inject the version into a js file', () => {
      const code = `function main() {
        return { great: 'application' }
      }`;
      const tag = '{version} - {date}';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const fileExt: SupportedFileExtensions = 'js';

      const expectedCode = `// 7.1.1 - ${dateformat(dateFormat)}\nfunction main() {
        return { great: 'application' }
      }`;

      const results = utils.injectIntoComments(
        tag,
        dateFormat,
        version,
        fileExt,
        code
      );
      expect(results).toEqual(expectedCode);
      expect(logger.debug).toHaveBeenCalledTimes(7);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('should inject the version into a html file', () => {
      const code = `<html>
        <body>static content</body>
      </html>`;
      const tag = '{version} - {date}';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const fileExt: SupportedFileExtensions = 'html';

      const expectedCode = `<!-- 7.1.1 - ${dateformat(dateFormat)} -->\n<html>
        <body>static content</body>
      </html>`;

      const results = utils.injectIntoComments(
        tag,
        dateFormat,
        version,
        fileExt,
        code
      );
      expect(results).toEqual(expectedCode);
      expect(logger.debug).toHaveBeenCalledTimes(7);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('should inject the version into a css file', () => {
      const code = `body {
        color: black;
      }`;
      const tag = '{version} - {date}';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const fileExt: SupportedFileExtensions = 'css';

      const expectedCode = `/* 7.1.1 - ${dateformat(dateFormat)} */\nbody {
        color: black;
      }`;

      const results = utils.injectIntoComments(
        tag,
        dateFormat,
        version,
        fileExt,
        code
      );
      expect(results).toEqual(expectedCode);
      expect(logger.debug).toHaveBeenCalledTimes(7);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    test('should not inject the version into an supported file (svg)', () => {
      const code = `<svg xmlns="something"></svg>`;
      const tag = '{version} - {date}';
      const dateFormat = 'longDate';
      const version = '7.1.1';
      const fileExt = 'svg' as SupportedFileExtensions;

      const results = utils.injectIntoComments(
        tag,
        dateFormat,
        version,
        fileExt,
        code
      );
      expect(results).toEqual(code);
      expect(logger.debug).toHaveBeenCalledTimes(6);
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('stripTags()', () => {
    test('should remove tags', () => {
      const string = '[VI]Here is text[/VI]';
      const result = utils['stripTags'](string, 'VI');
      expect(result).toBe('Here is text');
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe('buildTagRegexp()', () => {
    test('should return the proper RegExp with passed in tagId', () => {
      const regexp = utils['buildTagRegexp']('VI');
      expect(regexp).toEqual(/(\[VI\])(.*)(\[\/VI\])/g);
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should match against proper tags', () => {
      const testStr = '[VI] Version {version} - Date {date}[/VI]';
      const regexp = utils['buildTagRegexp']('VI');
      expect(testStr.match(regexp)).toBeTruthy();
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should not match against improper tags', () => {
      const testStr = '[VI ] Version {version} & Date {date}[VI]';
      const regexp = utils['buildTagRegexp']('VI');
      expect(testStr.match(regexp)).toBeFalsy();
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceVersion()', () => {
    test('should replace the "{version}"', () => {
      const string = 'Here is the {version} to change.';
      const result = utils['replaceVersion'](string, '1.1.3');
      expect(result).toBe('Here is the 1.1.3 to change.');
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
    test('should not replace anything if no "{version}"', () => {
      const string = 'Here is the version to change.';
      const result = utils['replaceVersion'](string, '1.1.3');
      expect(result).toBe(string);
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

  describe('replaceDate()', () => {
    test('should replace the "{date}" with the correct format', () => {
      const string = 'Here is the {date} to change.';
      const format = 'longDate';
      const date = dateformat(format);
      const result = utils['replaceDate'](string, format);
      expect(result).toBe(`Here is the ${date} to change.`);
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
    test('should not replace the "{date}" if not formed', () => {
      const string = 'Here is the date to change.';
      const format = 'longDate';
      const result = utils['replaceDate'](string, format);
      expect(result).toBe(string);
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

});
