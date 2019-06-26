// import { defaultConfig as config } from '../src/config'
// import fs from 'fs';
import versionInjector from '../../src/index';
import { ILogger, VersionInjectorConfig } from '../../src/types/interfaces';
import { OutputOptions } from 'rollup';
import { VILogger } from '../../src/utils/logger';

describe('injectVersion()', () => {
  let logger: ILogger;
  let basicConfig: Partial<VersionInjectorConfig>;
  let s;
  // let fsSpy: jest.SpyInstance;
  beforeEach(() => {
    logger = {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    s = jest.spyOn(VILogger.prototype, 'warn')

    basicConfig = {
      logger,
      packageJson: './test/unit/fake-package.json'
    };
    // fsSpy = jest.spyOn(fs, 'writeFileSync');
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
    expect(s).toHaveBeenCalledWith('no output file for outputOptions - skipping', outputOptions);
  });

  test('should log an info log and return file is in the excludes list', () => {
    if (!basicConfig.exclude) basicConfig.exclude = [];
    basicConfig.exclude.push('file.js');
    const result = versionInjector(basicConfig) as any;
    const outputOptions = { file: 'file.js' } as OutputOptions;
    result.generateBundle(outputOptions, {} as any, false);
    const outputBundle = {
      'file.js': {}
    };
    expect(result.writeBundle(outputBundle)).toBe(undefined);
  });


  // test('should do nothing', () => {
  //   expect(fsSpy).not.toHaveBeenCalled();
  // });
});
