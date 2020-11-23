import { ILogger, SupportedFileExtensions, InjectInTagsConfig, InjectInCommentsConfig } from '../types/interfaces';
export declare class VIInjector {
    private logger;
    private codeChanged;
    private code;
    constructor(logger: ILogger);
    getVersion(packagePath: string): string;
    setCode(code: string): void;
    isCodeChanged(): boolean;
    writeToFile(outputFile: string): void;
    getFileExtension(fileName: string): SupportedFileExtensions | null;
    injectIntoTags(config: InjectInTagsConfig | false, fileName: string, version: string): void;
    injectIntoComments(config: InjectInCommentsConfig | false, fileName: string, version: string): void;
    private replaceVersionInTags;
    private replaceVersionInComments;
    private stripTags;
    private buildTagRegexp;
    private replaceVersion;
    private replaceDate;
}
