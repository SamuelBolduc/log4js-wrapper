# log4js-wrapper

This is a wrapper around [log4js-node](https://github.com/nomiddlename/log4js-node) to simplify the simple use-case. `log4js` has a lot of options I don't use and I always ended up writing shortcut methods to just log with different levels.

The logging output of `log4js-wrapper` depends on the set environment. In `development` or `test` environments, when logging, the filename and line number of the log will be output. Very useful for debugging.

In `production` environment, only the alias is used. This avoids generating an Error stacktrace everytime we log something (like it does in `development` or `test` envs).

If you supply a filename as a third parameter in the constructor, logs will also be saved in that file.

This package uses many ES6 features; therefore, you must be running Node v5.0.0 or above.

## Usage

Minimalist example:

```javascript
const Logger = require('log4js-wrapper');
const log = new Logger('debug', 'test-logging');

log.d('This is a debug level log');
log.t('This is a trace level log');
log.i('This is an info level log');
```

Which will output in `development` env:

```
[2015-10-23 10:21:29.756] [DEBUG] test.js:4 - This is a debug level log
[2015-10-23 10:21:29.761] [INFO] test.js:6 - This is an info level log
```

And in `production` environment:

```
[2015-10-23 10:22:26.552] [DEBUG] test-logging - This is a debug level log
[2015-10-23 10:22:26.557] [INFO] test-logging - This is an info level log
```
## API

There are six methods, which correspond to the usual `log4js` log levels.

Here's an example using all methods:

```javascript
const Logger = require('log4js-wrapper');
const log = new Logger('trace', 'test-logging');

log.d('This ia a debug level log');
log.t('This is a trace level log');
log.i('This is an info level log');
log.w('This is a warn level log');
log.e('This is an error level log');
log.f('This is a fatal level log');
log.i('This log should not be shown since the node process whill have been terminated by the fatal log');
```

And here's the output in `development`:

```
[2015-10-23 10:36:27.304] [TRACE] test.js:4 - This is a trace level log
[2015-10-23 10:36:27.309] [DEBUG] test.js:5 - This ia a debug level log
[2015-10-23 10:36:27.311] [INFO] test.js:6 - This is an info level log
[2015-10-23 10:36:27.311] [WARN] test.js:7 - This is a warn level log
[2015-10-23 10:36:27.311] [ERROR] test.js:8 - This is an error level log
[2015-10-23 10:36:27.312] [FATAL] test.js:9 - This is a fatal level log
```

**IMPORTANT!**

Please note that `log.f()` method exits the process. Only use this in the initial loading phase of your app.  
