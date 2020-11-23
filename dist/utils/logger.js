import { default as chalk } from 'chalk';
export class VILogger {
    constructor(logLevel, logger = console) {
        this.DEFAULT_LOG_LEVEL = 3;
        this._logger = logger;
        this.internalLog = [];
        this.logMap = this.buildMap();
        let level = this.logMap.get(logLevel);
        if (level) {
            this.debug(`setting logging level to "${logLevel}"`);
        }
        else {
            level = this.DEFAULT_LOG_LEVEL;
            this.warn(`log level passed in was invalid ("${logLevel}"). setting log level to default ("warn")`);
        }
        this.logLevel = level;
    }
    log(...args) {
        this.logger('log', ...args);
    }
    debug(...args) {
        this.logger('debug', ...args);
    }
    info(...args) {
        this.logger('info', ...args);
    }
    warn(...args) {
        this.logger('warn', ...args);
    }
    error(...args) {
        this.logger('error', ...args);
    }
    logger(level, ...args) {
        if ((this.logMap.get(level) || this.DEFAULT_LOG_LEVEL) >= this.logLevel) {
            this._logger[level](chalk.magenta.bold('  [VI]'), chalk.yellow(`[${level.padEnd(5)}]`), ...args);
        }
        this.internalLog.push({ level, log: args });
    }
    buildMap() {
        const map = new Map();
        map.set('debug', 1);
        map.set('info', 2);
        map.set('warn', 3);
        map.set('error', 4);
        map.set('log', 5);
        return map;
    }
}
//# sourceMappingURL=logger.js.map