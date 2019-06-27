# rollup-plugin-version-injector
A simple [rollup.js](https://rollupjs.org/guide/en) plugin to inject your application's version number and/or today's date into your built `js`, `html`, and `css` files!

## Getting started

Install from npm
``` bash
npm i --save-dev rollup-plugin-version-injector
```

Add it to your `rollup.config.js` build configuration. 

``` js 
// import version-injector
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

**src/app.js** (fake file)
```js 
export class MyApp {
  getVersion() { 
    return '[VI]{version} - {date}[/VI]';
  }
  // other code
}
```

**version-injector** (**VI**) will replace that code in your built source to return the following: 

**dist/built-app.js** (fake build file)
```js 
export class MyApp {
  getVersion() { 
    return '1.2.1 - June 27, 2019';
  }
  // other code
}
```
VI will also inject the version into your files as a comment. Example: 

**dist/index.html** (fake file)
``` html
<!-- Version: 1.2.1 - June 27, 2019 -->
<!DOCTYPE html>
<html lang="en">
  ...
</html>
```
## Basic Usage

VI has two functions. It will Inject the version number and/or today's date into your generated files as:
1. [Defined tags in your source code.](####as-comment)
2. [A comment at the top of the file.](####in-source-code)

VI will replace `{version}` with the version listed in your `package.json` and `{date}` with today's date in the format specified in the [configuration](##configuration). 

> VI supports injecting the version into all `js`, `html`, and `css` files output by rollup. 

#### In source code
It will only look between the configured `tagId`s. For example, the default `tagId` is `VI` so VI is looking for: 
```js 
  '[VI]Version: {version} - build on {date}[/VI]'
``` 
If will only replace the `{version}` and `{date}` found within those `tagId`s. 

#### As comment
It will replace the `{version}` and `{date}` found in the configured `tag`. For example, the default configured `tag` is:
```js
tag: 'Version: {version} - {date}'
```

## Configuration

Anything not specified in your configuration will use the default configuration.  

**default config**
```js 
{
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
```

#### injectInComments
Can be set to `false` or an object with one or more of the following properties: 
```js 
{
  fileRegexp: // Regexp for files to match against
  tag: // string of tag to be injected
  dateFormat: // string of date format 
}
```

All available date formats can be found at [datefromat's](https://www.npmjs.com/package/dateformat) npm homepage. 

#### injectInTags
Can be set to `false` or an object with one or more of the following properties: 
```js 
{
  fileRegexp: // Regexp for files to match against
  tagId: // string of the tagId to look for
  dateFormat: // string of date format 
}
```
> **Note:** The `tagId` will be wrapped in opening and closing brackets.  Example: `[tagId][/tagId]`

All available date formats can be found at [datefromat's](https://www.npmjs.com/package/dateformat) npm homepage. 

#### packageJson
This is the relative path to your `package.json` file. Default is `'./package.json'`. 

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
This is essentially a less fancy port of the [webpack-auto-inject-version](https://github.com/radswiat/webpack-auto-inject-version).
