import { VersionInjectorConfig } from "../types/interfaces";

export const defaultConfig: VersionInjectorConfig = {
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
  packageJson: './package.json',
  logLevel: 'info',
  logger: console,
  exclude: []
};
