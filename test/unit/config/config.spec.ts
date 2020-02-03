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
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
      },
      injectInTags: {
        fileRegexp: /\.(js|html|css)$/g,
        tagId: 'VI',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
      },
      exclude: []
    };
    expect(defaultConfig).toEqual(expectedConfig);
  });
});
