import versionInjector from '../../src/index';
import { VersionInjectorConfig } from '../../src/types/interfaces';
import { VILogger } from '../../src/utils/logger';
import { VIInjector } from '../../src/utils/injector';

function buildLoggerSpy () {
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
        fileRegexp: /\.(js|html|css)$/,
        tag: 'Version: {version} - {date}',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
      },
      injectInTags: {
        fileRegexp: /\.(js|html|css)$/,
        tagId: 'VI',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
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

  test('should log an info log and return if file is in the excludes list', () => {
    if (!basicConfig.exclude) basicConfig.exclude = [];
    basicConfig.exclude.push('file.js');
    const result = versionInjector(basicConfig) as any;
    const chunk = {
      fileName: 'file.js'
    };
    expect(result.renderChunk('code', chunk)).toBe(undefined);
    expect(loggerSpy.info).toHaveBeenCalledWith('file was in the exclude list - skipping', 'file.js');
    basicConfig.exclude = [];
  });

  test('should log an info log and return if output bundle is an asset', () => {
    const result = versionInjector(basicConfig) as any;
    const chunk = {
      fileName: 'file.js',
      type: 'asset'
    };
    expect(result.renderChunk('code', chunk)).toBe(undefined);
    expect(loggerSpy.info).toHaveBeenCalledWith('output bundle was an asset - skipping', chunk.fileName);
  });

  test('should call injector setCode(), injectIntoTags(), and injectIntoComments() with the proper config and log if the file was not changed', () => {
    const result = versionInjector(basicConfig) as any;
    const code = 'var = 19;';
    const chunk = {
      fileName: 'file.js',
      code
    };

    const setCodeSpy = jest.spyOn(VIInjector.prototype, 'setCode').mockImplementation(() => null);
    const injectIntoTagsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoTags').mockImplementation(() => null);
    const injectIntoCommentsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoComments').mockImplementation(() => null);
    //const writeToFileSpy = jest.spyOn(VIInjector.prototype, 'writeToFile').mockImplementation(() => null);
    jest.spyOn(VIInjector.prototype, 'isCodeChanged').mockImplementation(() => false);

    expect(result.renderChunk(code, chunk)).toBe(undefined);
    expect(setCodeSpy).toHaveBeenCalledWith(code);
    expect(injectIntoTagsSpy).toHaveBeenCalledWith(basicConfig.injectInTags, 'file.js', '1.1.1');
    expect(injectIntoCommentsSpy).toHaveBeenCalledWith(basicConfig.injectInComments, 'file.js', '1.1.1');
    //expect(writeToFileSpy).not.toHaveBeenCalled();
    expect(loggerSpy.info).toHaveBeenCalledWith('file was not changed. did not write to file "file.js"');
  });

  test('should call injector setCode(), injectIntoTags(), and injectIntoComments() with the proper config and log if the file was changed', () => {
    const result = versionInjector(basicConfig) as any;
    const code = 'var = 19;';
    const chunk = {
      fileName: 'file.js',
      code
    };

    const setCodeSpy = jest.spyOn(VIInjector.prototype, 'setCode').mockImplementation(() => null);
    const injectIntoTagsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoTags').mockImplementation(() => null);
    const injectIntoCommentsSpy = jest.spyOn(VIInjector.prototype, 'injectIntoComments').mockImplementation(() => null);
    //const writeToFileSpy = jest.spyOn(VIInjector.prototype, 'writeToFile').mockImplementation(() => null);
    jest.spyOn(VIInjector.prototype, 'isCodeChanged').mockImplementation(() => true);

    expect(result.renderChunk(code, chunk)).toStrictEqual({ code: '', map: null });
    expect(setCodeSpy).toHaveBeenCalledWith(code);
    expect(injectIntoTagsSpy).toHaveBeenCalledWith(basicConfig.injectInTags, 'file.js', '1.1.1');
    expect(injectIntoCommentsSpy).toHaveBeenCalledWith(basicConfig.injectInComments, 'file.js', '1.1.1');
    //expect(writeToFileSpy).toHaveBeenCalledWith('dist/file.js');
    expect(loggerSpy.info).toHaveBeenCalledWith('version-injector finished');
  });
});
