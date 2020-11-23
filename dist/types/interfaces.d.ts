export interface VersionInjectorConfig {
    packageJson: string;
    injectInComments: false | InjectInCommentsConfig;
    injectInTags: false | InjectInTagsConfig;
    logLevel: LogLevel;
    logger: ILogger;
    exclude: string[];
}
export interface InjectInTagsConfig {
    fileRegexp: RegExp;
    tagId: string;
    dateFormat: string;
}
export interface InjectInCommentsConfig {
    fileRegexp: RegExp;
    tag: string;
    dateFormat: string;
}
export interface ILogger {
    log(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
export declare type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';
export declare type SupportedFileExtensions = 'js' | 'html' | 'css';
