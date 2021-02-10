import { default as chalk } from 'chalk';
import { VILogger } from '../../../src/utils/logger';
import { ILogger } from '../../../src/types/interfaces';

describe('VILogger', () => {
  let mockLogger: ILogger;
  let logger: VILogger;
  let logItSpy: jest.SpyInstance;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    logger = new VILogger('info', mockLogger);
    logItSpy = jest.spyOn(logger, 'logIt' as any);
  });

  describe('constructor()', () => {
    it('should set class\' numeric log level if valid level passed in', () => {
      expect(logger['logLevel']).toEqual(['info', 2]);
      expect(logger['internalLog']).toEqual([{ level: 'debug', log: ['setting logging level to "info"'] }]);
    });

    it('should set class\' numeric log level to default if invalid level passed in', () => {
      const tempLogger = new VILogger('high' as any, mockLogger);
      expect(tempLogger['logLevel']).toEqual(['warn', 3]);
      expect(tempLogger['internalLog']).toEqual([{ level: 'warn', log: ['log level passed in was invalid ("high"). setting log level to default ("warn")'] }]);
    });

    it('should use `console` as default logger', () => {
      const tempLogger = new VILogger('error');
      expect(tempLogger['logger']).toBe(console);
    });
  });

  describe('log()', () => {
    test("should call logger with 'log' and args", () => {
      logger.log('a', { b: 'c' });
      expect(logItSpy).toHaveBeenCalledWith('log', 'a', { b: 'c' });
    });
  });

  describe('debug()', () => {
    test("should call logger with 'debug' and args", () => {
      logger.debug('a', { b: 'c' });
      expect(logItSpy).toHaveBeenCalledWith('debug', 'a', { b: 'c' });
    });
  });

  describe('info()', () => {
    test("should call logger with 'info' and args", () => {
      logger.info('a', { b: 'c' });
      expect(logItSpy).toHaveBeenCalledWith('info', 'a', { b: 'c' });
    });
  });

  describe('warn()', () => {
    test("should call logger with 'warn' and args", () => {
      logger.warn('a', { b: 'c' });
      expect(logItSpy).toHaveBeenCalledWith('warn', 'a', { b: 'c' });
    });
  });

  describe('error()', () => {
    test("should call logger with 'error' and args", () => {
      logger.error('a', { b: 'c' });
      expect(logItSpy).toHaveBeenCalledWith('error', 'a', { b: 'c' });
    });
  });

  describe('logIt()', () => {
    let logItFn: typeof VILogger.prototype['logIt'];

    beforeEach(() => {
      logItSpy.mockRestore();
      logItFn = logger['logIt'].bind(logger);
    });

    it('should log if the level is equal to class\' log level', () => {
      logger['logLevel'] = ['info', 2];
      logItFn('info', 'arg1', 'arg2');
      expect(mockLogger.info).toHaveBeenCalledWith(
        chalk.magenta.bold('  [VI]'),
        chalk.yellow(`[${'info'.padEnd(5)}]`),
        'arg1',
        'arg2'
      );
    });

    it('should not log if the level is less than the class\' log level', () => {
      logger['logLevel'] = ['info', 2];
      logItFn('debug', 'arg1', 'arg2');
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should use default log level if current log level is not found', () => {
      logger['logLevel'] = ['info', 2];
      logItFn('debug', 'arg1', 'arg2');
      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should push log into internal log', () => {
      logger['logLevel'] = ['info', 2];
      logItFn('bad-log-level' as any, 'arg1', 'arg2'); // does not exist – defaults to 3 | 'warn'
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('buildMap()', () => {
    it('should build out a map of log levels and numeric values', () => {
      const map = logger['buildMap']();
      expect(map.get('debug')).toBe(1);
      expect(map.get('info')).toBe(2);
      expect(map.get('warn')).toBe(3);
      expect(map.get('error')).toBe(4);
      expect(map.get('log')).toBe(5);
    });
  });
});
