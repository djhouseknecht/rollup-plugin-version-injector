import fs from 'fs';
import path from 'path';
import dateformat from 'dateformat';
import { VIInjector } from '../../../src/utils/injector';
import { ILogger, SupportedFileExtensions } from '../../../src/types/interfaces';

describe('VIInjector', () => {
  let injector: VIInjector;
  let logger: ILogger;

  beforeEach(() => {
    logger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    injector = new VIInjector(logger);
  });

  describe('getVersion()', () => {
    test('should return the version from package.json', () => {
      const packageJson = "{\"name\":\"something-cool\",\"version\":\"100.2.55\"}";
      const spy = jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => packageJson);
      const result = injector.getVersion('./path/package.json');
      expect(result).toEqual('100.2.55');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setCode()', () => {
    test('should set the code and codeChanged', () => {
      const code = 'function() { return \'awesome\' }';
      injector.setCode(code);
      expect(injector['code']).toBe(code);
      expect(injector['codeChanged']).toBe(false);
    });
  });

  describe.skip('writeToFile()', () => {
    test('should write to file and log a message', () => {
      // TODO: this gives back a Max Call error...
      const code = "function() { return \'awesome\' }";
      const outputFile = 'file.js'
      const cwd = '/users/djhouse/final/';
      jest.spyOn(process, 'cwd').mockImplementation(() => cwd);
      const resolveSpy = jest.spyOn(path, 'resolve').mockImplementation(() => cwd + outputFile);
      const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);

      injector.setCode(code);
      injector.writeToFile(outputFile);
      console.log('wrote')
      expect(resolveSpy).toHaveBeenCalledWith(cwd, outputFile);
      expect(writeSpy).toHaveBeenCalledWith(cwd + outputFile, code);
      expect(logger.log).toHaveBeenCalled();
    });
  });

  describe('getFileExtension()', () => {
    test('should return js for .js files', () => {
      const file = '/project/index.js';
      expect(injector.getFileExtension(file)).toBe('js');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return js for .cjs files', () => {
      const file = '/project/index.cjs';
      expect(injector.getFileExtension(file)).toBe('js');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return html for .html files', () => {
      const file = '/project/index.html';
      expect(injector.getFileExtension(file)).toBe('html');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should return css for .css files', () => {
      const file = '/project/styles.css';
      expect(injector.getFileExtension(file)).toBe('css');
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('injectIntoTags()', () => {
    test('should log an error and return if there is no code on the class instance', () => {
      const config = { fileRegexp: /./, tagId: 'VI', dateFormat: 'longdate' };
      injector.injectIntoTags(config, 'file.js', '12.1.1');
      expect(logger.error).toHaveBeenCalledWith('code not set in VIInjector called from injectIntoTags()');
    });

    test('should log a debug message if config is set to false', () => {
      const config = false;
      const code = 'var = 12;';
      injector.setCode(code);
      injector.injectIntoTags(config, 'file.js', '12.1.1');
      expect(logger.debug).toHaveBeenCalledWith('injectInTages skipped because it was set to "false" or fileName did not match expression', config);
    });

    test('should log a debug message if config fileRegexp does not match', () => {
      const config = { fileRegexp: /\.(js)$/g, tagId: 'VI', dateFormat: 'longdate' };
      const code = 'var = 12;';
      injector.setCode(code);
      injector.injectIntoTags(config, 'file.cjs', '12.1.1');
      expect(logger.debug).toHaveBeenCalledWith('injectInTages skipped because it was set to "false" or fileName did not match expression', config);
    });

    test('should log an info message if code was not changed', () => {
      const config = { fileRegexp: /\./, tagId: 'VI', dateFormat: 'longdate' };
      const code = 'var = 12;';
      injector.setCode(code);
      jest.spyOn(injector, 'replaceVersionInTags' as any).mockImplementationOnce(() => {
        return { replaceCount: 0, code };
      });

      injector.injectIntoTags(config, 'file.js', '12.1.1');
      expect(injector.isCodeChanged()).toBe(false);
      expect(injector['code']).toBe(code);
      expect(logger.info).toHaveBeenCalledWith('no tags found in file: "file.js"');
    });

    test('should log a message, set code, and codeChanged if code was changed', () => {
      const config = { fileRegexp: /\./, tagId: 'VI', dateFormat: 'longdate' };
      const code = 'var = 12;';
      const changedCode = 'var = 29;';
      injector.setCode(code);
      jest.spyOn(injector, 'replaceVersionInTags' as any).mockImplementationOnce(() => {
        return { replaceCount: 2, code: changedCode };
      });

      injector.injectIntoTags(config, 'file.js', '12.1.1');
      expect(injector.isCodeChanged()).toBe(true);
      expect(injector['code']).toBe(changedCode);
      expect(logger.log).toHaveBeenCalledWith('found and replaced [2] version tags in', 'file.js');
    });
  });

  describe('injectIntoComments()', () => {
    test('should log an error and return if there is no code on the class instance', () => {
      const config = { fileRegexp: /./, tag: '{version}', dateFormat: 'longdate' };
      injector.injectIntoComments(config, 'file.js', '12.1.1');
      expect(logger.error).toHaveBeenCalledWith('code not set in VIInjector called from injectIntoComments()');
    });

    test('should log a debug message if config is set to false', () => {
      const config = false;
      const code = 'var = 12;';
      injector.setCode(code);
      injector.injectIntoComments(config, 'file.js', '12.1.1');
      expect(logger.debug).toHaveBeenCalledWith('injectIntoComments skipped because it was set to "false" or fileName did not match expression', config);
    });

    test('should log a debug message if config fileRegexp does not match', () => {
      const config = { fileRegexp: /\.(js)$/g, tag: '{version}', dateFormat: 'longdate' };
      const code = 'var = 12;';
      injector.setCode(code);
      injector.injectIntoComments(config, 'file.cjs', '12.1.1');
      expect(logger.debug).toHaveBeenCalledWith('injectIntoComments skipped because it was set to "false" or fileName did not match expression', config);
    });

    test('should log a warn message if file extension is not supported', () => {
      const config = { fileRegexp: /\.(cpp)$/g, tag: '{version}', dateFormat: 'longdate' };
      const code = 'var = 12;';
      injector.setCode(code);
      injector.injectIntoComments(config, 'file.cpp', '12.1.1');
      expect(logger.warn).toHaveBeenCalledWith('file extension not supported for injecting into comments "null"');
    });

    test('should log a message, set code, and codeChanged if version was injected as a comment', () => {
      const config = { fileRegexp: /\.(js)$/g, tag: '{version}', dateFormat: 'longdate' };
      const code = 'var = 12;';
      const expectedCode = '// 12.1.1 \n' + code;
      injector.setCode(code);
      jest.spyOn(injector, 'replaceVersionInComments' as any).mockImplementationOnce(() => expectedCode);

      injector.injectIntoComments(config, 'file.js', '12.1.1');
      expect(injector.isCodeChanged()).toBe(true);
      expect(injector['code']).toBe(expectedCode);
      expect(logger.info).toHaveBeenCalledWith('injected version as comment');
    });
  });

  describe('replaceVersionInTags()', () => {
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

      const results = injector['replaceVersionInTags'](
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
      const results = injector['replaceVersionInTags'](
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

      const results = injector['replaceVersionInTags'](
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

      const results = injector['replaceVersionInTags'](
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code, replaceCount: 0 });
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

  describe('replaceVersionInComments()', () => {
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

      const results = injector['replaceVersionInComments'](
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

      const results = injector['replaceVersionInComments'](
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

      const results = injector['replaceVersionInComments'](
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

      const results = injector['replaceVersionInComments'](
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
      const result = injector['stripTags'](string, 'VI');
      expect(result).toBe('Here is text');
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
  });

  describe('buildTagRegexp()', () => {
    test('should return the proper RegExp with passed in tagId', () => {
      const regexp = injector['buildTagRegexp']('VI');
      expect(regexp).toEqual(/(\[VI\])(.*)(\[\/VI\])/g);
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should match against proper tags', () => {
      const testStr = '[VI] Version {version} - Date {date}[/VI]';
      const regexp = injector['buildTagRegexp']('VI');
      expect(testStr.match(regexp)).toBeTruthy();
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
    test('should not match against improper tags', () => {
      const testStr = '[VI ] Version {version} & Date {date}[VI]';
      const regexp = injector['buildTagRegexp']('VI');
      expect(testStr.match(regexp)).toBeFalsy();
      expect(logger.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('replaceVersion()', () => {
    test('should replace the "{version}"', () => {
      const string = 'Here is the {version} to change.';
      const result = injector['replaceVersion'](string, '1.1.3');
      expect(result).toBe('Here is the 1.1.3 to change.');
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
    test('should not replace anything if no "{version}"', () => {
      const string = 'Here is the version to change.';
      const result = injector['replaceVersion'](string, '1.1.3');
      expect(result).toBe(string);
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

  describe('replaceDate()', () => {
    test('should replace the "{date}" with the correct format', () => {
      const string = 'Here is the {date} to change.';
      const format = 'longDate';
      const date = dateformat(format);
      const result = injector['replaceDate'](string, format);
      expect(result).toBe(`Here is the ${date} to change.`);
      expect(logger.debug).toHaveBeenCalledTimes(2);
    });
    test('should not replace the "{date}" if not formed', () => {
      const string = 'Here is the date to change.';
      const format = 'longDate';
      const result = injector['replaceDate'](string, format);
      expect(result).toBe(string);
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });
  });

});
