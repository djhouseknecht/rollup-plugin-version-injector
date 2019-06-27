import versionInjector from '../../src/index';
import { VersionInjectorConfig } from '../../src/types/interfaces';
import { OutputOptions } from 'rollup';
import { VILogger } from '../../src/utils/logger';
import { VIInjector } from '../../src/utils/injector';

function buildLoggerSpy() {
  return {
    log: jest.spyOn(VILogger.prototype, 'log').mockImplementation(() => null),
    debug: jest.spyOn(VILogger.prototype, 'debug').mockImplementation(() => null),
    info: jest.spyOn(VILogger.prototype, 'info').mockImplementation(() => null),
    warn: jest.spyOn(VILogger.prototype, 'warn').mockImplementation(() => null),
    error: jest.spyOn(VILogger.prototype, 'error').mockImplementation(() => null)
  }
}

describe('injectVersion()', () => {
  let loggerSpy;
  let basicConfig: Partial<VersionInjectorConfig>;
  beforeEach(() => {
    loggerSpy = buildLoggerSpy();
    basicConfig = {
      packageJson: './test/unit/fake-package.json',
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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should return plugin name', () => {
    const result = versionInjector(basicConfig);
    expect(result.name).toBe('version-injector');
  });

  test('should log a warning and return if no file was generated in OutputOptions', () => {
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: undefined } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const outputBundle = {};
    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(loggerSpy.warn).toHaveBeenCalledWith('no output file for outputOptions - skipping', outputOptions);
  });

  test('should log an info log and return if file is in the excludes list', () => {
    if (!basicConfig.exclude) basicConfig.exclude = [];
    basicConfig.exclude.push('file.js');
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const outputBundle = {
      'file.js': {}
    };
    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(loggerSpy.info).toHaveBeenCalledWith('file was in the exclude list - skipping', 'file.js');
    basicConfig.exclude = [];
  });

  test('should log an info log and return if output bundle does not exist', () => {
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const outputBundle = { };
    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(loggerSpy.info).toHaveBeenCalledWith('output bundle did not exist or was an asset - skipping', undefined);
  });

  test('should log an info log and return if output bundle is an asset', () => {
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const outputBundle = {
      'file.js': { isAsset: true }
    };
    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(loggerSpy.info).toHaveBeenCalledWith('output bundle did not exist or was an asset - skipping', { isAsset: true });
  });

  test('should call injector setCode(), injectIntoTags(), and injectIntoComments() with the proper config and log if the file was not changed', () => {
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const code = 'var = 19;';
    const outputBundle = {
      'file.js': { code }
    };

    const setCodeSpy = jest.spyOn(VIInjector.prototype, 'setCode').mockImplementation(() => null);
    const injectIntoTagsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoTags').mockImplementation(() => null);
    const injectIntoCommentsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoComments').mockImplementation(() => null);
    const writeToFileSpy = jest.spyOn(VIInjector.prototype, 'writeToFile').mockImplementation(() => null);
    jest.spyOn(VIInjector.prototype, 'isCodeChanged').mockImplementation(() => false);

    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(setCodeSpy).toHaveBeenCalledWith(code);
    expect(injectIntoTagsSpy).toHaveBeenCalledWith(basicConfig.injectInTags, 'file.js', '1.1.1');
    expect(injectIntoCommentsSpy).toHaveBeenCalledWith(basicConfig.injectInComments, 'file.js', '1.1.1');
    expect(writeToFileSpy).not.toHaveBeenCalled();
    expect(loggerSpy.log).toHaveBeenCalledWith('file was not changed. did not write to file "file.js"');
  });

  test('should call injector setCode(), injectIntoTags(), and injectIntoComments() with the proper config and log if the file was changed', () => {
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const code = 'var = 19;';
    const outputBundle = {
      'file.js': { code }
    };

    const setCodeSpy = jest.spyOn(VIInjector.prototype, 'setCode').mockImplementation(() => null);
    const injectIntoTagsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoTags').mockImplementation(() => null);
    const injectIntoCommentsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoComments').mockImplementation(() => null);
    const writeToFileSpy = jest.spyOn(VIInjector.prototype, 'writeToFile').mockImplementation(() => null);
    jest.spyOn(VIInjector.prototype, 'isCodeChanged').mockImplementation(() => true);

    expect(result.writeBundle(outputBundle)).toBe(undefined);
    expect(setCodeSpy).toHaveBeenCalledWith(code);
    expect(injectIntoTagsSpy).toHaveBeenCalledWith(basicConfig.injectInTags, 'file.js', '1.1.1');
    expect(injectIntoCommentsSpy).toHaveBeenCalledWith(basicConfig.injectInComments, 'file.js', '1.1.1');
    expect(writeToFileSpy).toHaveBeenCalledWith('file.js');
    expect(loggerSpy.log).toHaveBeenCalledWith('version-injector finished');
  });
});
