[![Build Status](https://travis-ci.org/djhouseknecht/rollup-plugin-version-injector.svg?branch=master)](https://travis-ci.org/djhouseknecht/rollup-plugin-version-injector)  [![codecov](https://codecov.io/gh/djhouseknecht/rollup-plugin-version-injector/branch/master/graph/badge.svg)](https://codecov.io/gh/djhouseknecht/rollup-plugin-version-injector)  [![npm version](https://badge.fury.io/js/rollup-plugin-version-injector.svg)](https://badge.fury.io/js/rollup-plugin-version-injector)  [![dependabot-status](https://flat.badgen.net/dependabot/djhouseknecht/rollup-plugin-version-injector/?icon=dependabot)](https://dependabot.com)  [![semantic-release](https://img.shields.io/badge/20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)  [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 

# rollup-plugin-version-injector
A simple [rollup.js] plugin to inject your application's version number and/or today's date into your built `js`, `html`, and `css` files!

## Getting started

Install from npm
``` bash
npm i --save-dev rollup-plugin-version-injector
```

Add it to your `rollup.config.js` build configuration. 

``` js 
import versionInjector from 'rollup-plugin-version-injector';
// or
const versionInjector = require('rollup-plugin-version-injector');

export default {
  // other configuration
  plugins: [
    versionInjector()
    // any other plugins
  ]
};
```

Then you can add tags to your source code and it will inject the version where you specified. Example: 

**src/app.js** (example file)
```js 
export class MyApp {
  getVersion() { 
    return '[VI]{version} - {date}[/VI]';
  }
  // other code
}
```

**version-injector** (**VI**) will replace that code in your built source to return the following: 

**build/built-app.js** (example build file)
```js 
export class MyApp {
  getVersion() { 
    return '1.2.1 - June 9, 2007 17:46:12';
  }
  // other code
}
```
VI will also inject the version into your files as a comment. Example: 

**build/index.html** (example file)
``` html
<!-- Version: 1.2.1 - June 9, 2007 17:46:12 -->
<!DOCTYPE html>
<html lang="en">
  ...
</html>
```
## Basic Usage

VI has two uses -- it will Inject the version number and/or today's date into your generated files in:
1. [Defined tags in your source code.](####injected-in-the-source-code)
2. [A comment at the top of the file.](####as-a-comment)

VI will replace `'{version}'` with the version found in your `package.json` and `'{date}'` with today's date in the format specified in the [configuration].

> VI supports injecting the version into all `js`, `html`, and `css` files output by rollup. 

## Injected in the source code
VI will only look between the configured `tagId`s. For example, the default `tagId` is `VI` so VI is looking for: 
```js 
// string in your javascript file
const VERSION = '[VI]Version: {version} - built on {date}[/VI]';
``` 
VI will only replace the `'{version}'` and `'{date}'` found within those `tagId`s. 
```js 
// output after VI has run
const VERSION = 'Version: 1.2.1 - built on June 9, 2007 17:46:12';
``` 

You can change the date format, tagId, and which files to look in using the [configuration] object passed into the `versionInjector()` function. 

## As a comment
It will replace the `'{version}'` and `'{date}'` found in the configured `tag`. For example, the default configured `tag` is:
```js
tag: 'Version: {version} - {date}'
```

You can change the date format, tag, and which files to inject the comment into using the [configuration] object passed into the `versionInjector()` function. 


## Configuration

Anything not specified/overwritten in your `versionInjector()` configuration will use the default configuration. 

**default config**
```js 
{
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
  packageJson: './package.json',
  logLevel: 'info',
  logger: console,
  exclude: []
};
```

All available date formats can be found at [dateformat]. 

#### injectInTags
The following properties are available:
```typescript 
versionInjector({
  injectInTags: false /* or */ {
    // Regexp for files to match against
    fileRegexp: Regex 
    // string of the tagId to look for
    // Ex: 'ACK' => VI will look for '[ACK]...[/ACK]'
    tagId: string 
    // string of valid dateformat 
    dateFormat: string 
  }
})
```
> **Note:** The `tagId` will be wrapped in opening and closing brackets.  Example: `[tagId][/tagId]`

All available date formats can be found at [dateformat]. 

#### injectInComments
The following properties are available:
```typescript 
versionInjector({
  injectInComments: false /* or */ {
    // Regexp for files to match against
    fileRegexp: Regex 
    // string of tag to be injected
    tagId: string 
    // string of valid dateformat 
    dateFormat: string 
  }
})
```

#### packageJson
This is the relative path to your `package.json` file from your rollup config file. Default is `'./package.json'`. 

#### logLevel
This is the log levels for verion-injector. Default value is `'info'`. Available values are:
``` 
'debug', 'info', 'warn', 'error'
```

#### logger
Default is the `console`, but can be any logger you prefer that matches the [`ILogger`](src/types/interfaces.ts#ILogger) interface. 

#### excludes 
This is an array of specific files you want to exclude from any processing. This must be the full file name without the path. 

## Credits
This is essentially a less fancy port of the [webpack-auto-inject-version].

[rollup.js]: https://rollupjs.org/guide/en
[dateformat]: https://www.npmjs.com/package/dateformat
[dateformat's]: https://www.npmjs.com/package/dateformat
[webpack-auto-inject-version]: https://github.com/radswiat/webpack-auto-inject-version
[configuration]: ##configuration