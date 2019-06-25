import { LogLevel } from '../utils/logger';
export interface AutoInjectVersionConfig {

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
  include: string[];
  exclude: string[];
}

export type SupportedFileExtensions = 'js' | 'html' | 'css';

export const defaultConfig: AutoInjectVersionConfig = {
  packageJson: './package.json',
  logLevel: 'info',
  injectInComments: {
    fileRegexp: /\.(js|html|css)$/g,
    tag: 'Version: {version} - {date}',
    dateFormat: 'longDate'
  },
  injectInTags: {
    fileRegexp: /\.(js|html|css)$/g,
    tagId: 'VI',
    dateFormat: 'longDate'
  },
  include: [],
  exclude: []
};
