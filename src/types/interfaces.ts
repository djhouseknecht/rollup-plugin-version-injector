export interface VersionInjectorConfig {

	/**
	 * relative path to project's package.json
	 * @default './package.json'
	 */
  packageJson: string;

  injectInComments: false | {
    fileRegexp: RegExp;
    tag: string;
    dateFormat: string;
  };
  injectInTags: false | {
    fileRegexp: RegExp; // supported types: html, css, js
    tagId: string; // cannot have special characters
    dateFormat: string;
  };
  logLevel: LogLevel;
  logger: ILogger;
  exclude: string[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

export interface ILogger {
  log (...args: any[]): void;
  debug (...args: any[]): void;
  info (...args: any[]): void;
  warn (...args: any[]): void;
  error (...args: any[]): void;
}

export type SupportedFileExtensions = 'js' | 'html' | 'css';
