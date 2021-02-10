import { default as chalk } from 'chalk';
import { ILogger, LogLevel, LogNumericValue } from '../types/interfaces';

/**
 * Logger class to log, filter what logs are displayed, and store private logs
 */
export class VILogger implements ILogger {

  private readonly DEFAULT_LOG_LEVEL: [LogLevel, LogNumericValue] = ['warn', 3];
  private logLevel: [LogLevel, LogNumericValue];
  private internalLog: Array<{ level: LogLevel, log: any }>;
  private logMap: Map<LogLevel, LogNumericValue>;
  private logger: ILogger;

  /**
   * Construct a logger with the desired log level and logger.
   * @param logLevel desired log level
   * @param logger desired logger
   */
  constructor (logLevel: LogLevel, logger: ILogger = console) {
    this.logger = logger;
    this.internalLog = [];
    this.logMap = this.buildMap();

    let logLevelNum: LogNumericValue | undefined = this.logMap.get(logLevel);
    let configLogLevel: LogLevel = 'debug';
    let configLogMessage = `setting logging level to "${logLevel}"`;

    if (!logLevelNum) {
      configLogMessage = `log level passed in was invalid ("${logLevel}"). setting log level to default ("${this.DEFAULT_LOG_LEVEL[0]}")`;
      configLogLevel = 'warn';
      logLevel = this.DEFAULT_LOG_LEVEL[0];
      logLevelNum = this.DEFAULT_LOG_LEVEL[1];
    }

    this.logLevel = [logLevel, logLevelNum];
    this[configLogLevel](configLogMessage);
  }

  /**
   * Log arguments. `'log'` will also be logged.
   * @param args arguments to log
   */
  public log (...args: any[]) {
    this.logIt('log', ...args);
  }

  /**
   * Log arguments as debug. They will only be logged if
   * 	the log level was set to `'debug'`.
   * @param args arguments to log
   */
  public debug (...args: any[]): void {
    this.logIt('debug', ...args);
  }

  /**
   * Log arguments as info. They will only be logged if
   * 	the log level was set to `'info'` or `'debug'`.
   * @param args arguments to log
   */
  public info (...args: any[]): void {
    this.logIt('info', ...args);
  }

  /**
   * Log arguments as warn. They will only be logged if
   * 	the log level was set to `'warn'`, `'info'`, or `'debug'`.
   * This is the default log level.
   * @param args arguments to log
   */
  public warn (...args: any[]): void {
    this.logIt('warn', ...args);
  }

  /**
   * Log arguments as eror. `'error'` will also be logged.
   * @param args arguments to log
   */
  public error (...args: any[]): void {
    this.logIt('error', ...args);
  }

  /**
   * Log to configured logger and push to internalLog.
   * @param level level level
   * @param args arguments to log
   */
  private logIt (level: LogLevel, ...args: any[]): void {
    let logLevel = this.logMap.get(level);

    if (!logLevel) {
      logLevel = this.logLevel[1];
      level = this.logLevel[0];
    }

    if (logLevel >= this.logLevel[1]) {
      this.logger[level](
        chalk.magenta.bold('  [VI]'),
        chalk.yellow(`[${level.padEnd(5)}]`),
        ...args);
    }
    this.internalLog.push({ level, log: args });
  }

  /**
   * Build a map of {@link LogLevel} to {@link LogNumbers}
   */
  private buildMap (): Map<LogLevel, LogNumericValue> {
    const map = new Map();
    map.set('debug', 1);
    map.set('info', 2);
    map.set('warn', 3);
    map.set('error', 4);
    map.set('log', 5);
    return map;
  }

}
