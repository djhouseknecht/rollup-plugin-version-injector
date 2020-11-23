import { ILogger, LogLevel } from '../types/interfaces';
export declare class VILogger implements ILogger {
    private readonly DEFAULT_LOG_LEVEL;
    private logLevel;
    private internalLog;
    private logMap;
    private _logger;
    constructor(logLevel: LogLevel, logger?: ILogger);
    log(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    private logger;
    private buildMap;
}
