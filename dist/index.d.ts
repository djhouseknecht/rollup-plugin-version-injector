import { Plugin } from 'rollup';
import { VersionInjectorConfig } from './types/interfaces';
export default function versionInjector(userConfig?: Partial<VersionInjectorConfig>): Partial<Plugin>;
