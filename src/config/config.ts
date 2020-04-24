import { VersionInjectorConfig } from '../types/interfaces';

export const defaultConfig: VersionInjectorConfig = {
  injectInComments: {
    fileRegexp: /\.(js|html|css)$/,
    tag: 'Version: {version} - {date}',
    dateFormat: 'mmmm d, yyyy HH:MM:ss'
  },
  injectInTags: {
    fileRegexp: /\.(js|html|css)$/,
    tagId: 'VI',
    dateFormat: 'mmmm d, yyyy HH:MM:ss'
  },
  packageJson: './package.json',
  logLevel: 'info',
  logger: console,
  exclude: []
};
