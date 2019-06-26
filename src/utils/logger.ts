import { default as chalk } from 'chalk';
import { ILogger, LogLevel } from '../types/interfaces';

type LogNumbers = 1 | 2 | 3 | 4;
/**
 * Logger class to log, filter what logs are displayed, and store private logs
 */
export class VILogger implements ILogger {

  private readonly DEFAULT_LOG_LEVEL: LogNumbers = 3; // 'warn'

  private logLevel: LogNumbers;
  private internalLog: Array<{ level: LogLevel, log: any }>;
  private logMap: Map<LogLevel, LogNumbers>;
  private _logger: ILogger;

	/**
	 * Construct a logger with the desired log level and logger.
	 * @param logLevel desired log level
	 * @param logger desired logger
	 */
  constructor (logLevel: LogLevel, logger: ILogger = console) {
    this._logger = logger;
    this.internalLog = [];
    this.logMap = this.buildMap();

    let level: LogNumbers | undefined = this.logMap.get(logLevel);
    if (level) {
      this.debug(`setting logging level to "${logLevel}"`);
    } else {
      level = this.DEFAULT_LOG_LEVEL;
      this.warn(`log level passed in was invalid ("${logLevel}"). setting log level to default ("warn")`);
    }
    this.logLevel = level;
  }

	/**
	 * Log arguments. `'log'` will also be logged.
	 * @param args arguments to log
	 */
  public log (...args: any[]) {
    this.logger('log', ...args);
  }

	/**
	 * Log arguments as debug. They will only be logged if
	 * 	the log level was set to `'debug'`.
	 * @param args arguments to log
	 */
  public debug (...args: any[]): void {
    this.logger('debug', ...args);
  }

	/**
	 * Log arguments as info. They will only be logged if
	 * 	the log level was set to `'info'` or `'debug'`.
	 * @param args arguments to log
	 */
  public info (...args: any[]): void {
    this.logger('info', ...args);
  }

	/**
	 * Log arguments as warn. They will only be logged if
	 * 	the log level was set to `'warn'`, `'info'`, or `'debug'`.
	 * This is the default log level.
	 * @param args arguments to log
	 */
  public warn (...args: any[]): void {
    this.logger('warn', ...args);
  }

	/**
	 * Log arguments as eror. `'error'` will also be logged.
	 * @param args arguments to log
	 */
  public error (...args: any[]): void {
    this.logger('error', ...args);
  }

	/**
	 * Log to configured logger and push to internalLog.
	 * @param level level level
	 * @param args arguments to log
	 */
  private logger (level: LogLevel, ...args: any[]): void {
    if ((this.logMap.get(level) || this.DEFAULT_LOG_LEVEL) >= this.logLevel) {
      this._logger[level](
        chalk.magenta.bold('  [VI]'),
        chalk.yellow(`[${level.padEnd(5)}]`),
        ...args);
    }
    this.internalLog.push({ level, log: args });
  }

	/**
	 * Build a map of {@link LogLevel} to {@link LogNumbers}
	 */
  private buildMap (): Map<LogLevel, LogNumbers> {
    const map = new Map();
    map.set('debug', 1);
    map.set('info', 2);
    map.set('warn', 3);
    map.set('error', 4);
    map.set('log', 5);
    return map;
  }

}
