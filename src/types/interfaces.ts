export interface VersionInjectorConfig {

  /**
   * relative path to project's package.json
   * @default './package.json'
   */
  packageJson: string;
  injectInComments: false | InjectInCommentsConfig;
  injectInTags: false | InjectInTagsConfig;
  logLevel: LogLevel;
  logger: ILogger;
  exclude: string[];
}

export interface InjectInTagsConfig {
  fileRegexp: RegExp; // supported types: html, css, js
  tagId: string; // cannot have special characters
  dateFormat: string;
}

export interface InjectInCommentsConfig {
  fileRegexp: RegExp;
  tag: string;
  dateFormat: string;
}

export interface ILogger {
  log (...args: any[]): void;
  debug (...args: any[]): void;
  info (...args: any[]): void;
  warn (...args: any[]): void;
  error (...args: any[]): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';
export type LogNumericValue = 1 | 2 | 3 | 4; // these correspond with LogLevel

export type SupportedFileExtensions = 'js' | 'html' | 'css';
