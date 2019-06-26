import { VersionInjectorConfig } from "../types/interfaces";

export const defaultConfig: VersionInjectorConfig = {
  packageJson: './package.json',
  logLevel: 'info',
  logger: console,
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
  exclude: []
};
