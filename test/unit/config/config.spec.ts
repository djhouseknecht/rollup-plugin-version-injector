import { defaultConfig } from '../../../src/config/config';
describe('Config', () => {
  test('should return default configuratio', () => {
    const expectedConfig = {
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
    expect(defaultConfig).toEqual(expectedConfig);
  });
});
