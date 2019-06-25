import dateformat from 'dateformat';
import { VIUtils } from '../../src/utils/utils';
import { ILogger } from '../../src/utils/logger';

describe('VIUtils | private methods', () => {
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
