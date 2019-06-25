import fs from 'fs';
import dateformat from 'dateformat';
import { VIUtils } from '../../src/utils/utils';
import { ILogger } from '../../src/utils/logger';

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
      let code = `{
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

      let results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code: expectedCode, replaceCount: 1 });
      expect(logger.debug).toHaveBeenCalledTimes(11);
    });

    test('should replace multiple occurrances of the found tagId', () => {
      let code = `<div>
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
      let results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code: expectedCode, replaceCount: 2 });
      expect(logger.debug).toHaveBeenCalledTimes(19);
    });

    test('should replace nothing if proper tag is not found', () => {
      let code = `function getVersion() {
        return '[VI] incorrect tags for {version}[VI]'
      }`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';

      let results = utils.injectIntoTags(
        tagId,
        dateFormat,
        version,
        code
      );
      expect(results).toEqual({ code, replaceCount: 0 });
      expect(logger.debug).toHaveBeenCalledTimes(3);
    });

    test('should replace nothing if tags span across new lines', () => {
      let code = `<div>
        <span>[VI]{version} -
          {date}[/VI]</span>
      </div>`;
      const tagId = 'VI';
      const dateFormat = 'longDate';
      const version = '7.1.1';

      let results = utils.injectIntoTags(
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
    test.skip('should write some tests', () => {
      fail('no tests');
    });
  });

});
