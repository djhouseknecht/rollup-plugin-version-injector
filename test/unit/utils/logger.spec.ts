import { default as chalk } from 'chalk';
import { VILogger } from '../../../src/utils/logger';
import { ILogger } from '../../../src/types/interfaces';

describe.only('VILogger', () => {
  let _logger: ILogger;
  let logger: VILogger;
  let loggerSpy: jest.SpyInstance;

  beforeEach(() => {
    _logger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    logger = new VILogger('info', _logger);
    loggerSpy = jest.spyOn(logger, 'logger' as any);
  });

  describe('constructor()', () => {
    test('should set class\' numeric log level if valid level passed in', () => {
      expect(logger['logLevel']).toBe(2); //info
      expect(logger['internalLog']).toEqual([{ level: 'debug', log: ['setting logging level to "info"'] }]);
    });

    test('should set class\' numeric log level to default if invalid level passed in', () => {
      const tempLogger = new VILogger('high' as any, _logger);
      expect(tempLogger['logLevel']).toBe(3); //warn (default)
      expect(tempLogger['internalLog']).toEqual([{ level: 'warn', log: ['log level passed in was invalid ("high"). setting log level to default ("warn")'] }]);
    });
  });

  describe('log()', () => {
    test("should call logger with 'log' and args", () => {
      logger.log('a', { b: 'c' });
      expect(loggerSpy).toHaveBeenCalledWith('log', 'a', { b: 'c' });
    });
  });
  describe('debug()', () => {
    test("should call logger with 'debug' and args", () => {
      logger.debug('a', { b: 'c' });
      expect(loggerSpy).toHaveBeenCalledWith('debug', 'a', { b: 'c' });
    });
  });
  describe('info()', () => {
    test("should call logger with 'info' and args", () => {
      logger.info('a', { b: 'c' });
      expect(loggerSpy).toHaveBeenCalledWith('info', 'a', { b: 'c' });
    });
  });
  describe('warn()', () => {
    test("should call logger with 'warn' and args", () => {
      logger.warn('a', { b: 'c' });
      expect(loggerSpy).toHaveBeenCalledWith('warn', 'a', { b: 'c' });
    });
  });
  describe('error()', () => {
    test("should call logger with 'error' and args", () => {
      logger.error('a', { b: 'c' });
      expect(loggerSpy).toHaveBeenCalledWith('error', 'a', { b: 'c' });
    });
  });

  describe('logger()', () => {
    beforeEach(() => {
      loggerSpy.mockRestore();
    });
    test('should log if the level is equal to class\' log level', () => {
      logger['logLevel'] = 2; // 'info'
      logger['logger']('info', 'arg1', 'arg2');
      expect(_logger.info).toHaveBeenCalledWith(
        chalk.magenta.bold('  [VI]'),
        chalk.yellow(`[${'info'.padEnd(5)}]`),
        'arg1',
        'arg2'
      );
    });

    test('should not log if the level is less than the class\' log level', () => {
      logger['logLevel'] = 2; // 'info'
      logger['logger']('debug', 'arg1', 'arg2');
      expect(_logger.info).not.toHaveBeenCalled();
    });

    test('should push log into internal log', () => {
      logger['logLevel'] = 2; // 'info'
      logger['logger']('debug', 'arg1', 'arg2');
      expect(_logger.info).not.toHaveBeenCalled();
    });
  });

  describe('buildMap()', () => {
    test('should build out a map of log levels and numeric values', () => {
      const map = logger['buildMap']();
      expect(map.get('debug')).toBe(1);
      expect(map.get('info')).toBe(2);
      expect(map.get('warn')).toBe(3);
      expect(map.get('error')).toBe(4);
      expect(map.get('log')).toBe(5);
    });
  });
});
