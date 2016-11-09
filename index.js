'use strict';

const log4js = require('log4js');
const stack = require('callsite');
const util = require('util');

const env = process.env.NODE_ENV || 'development';

class Logger {
  constructor(level, alias, filename) {
    this.alias = alias || null;
    this.logLevel = level.toLowerCase() || 'trace';
    this.forceAlias = false;
    this.pathOffset = 0;
    const prodAlias = this.alias || stack()[2].getFileName().split('/').splice(__filename.split('/').length - (2 + this.pathOffset)).join('/');
    const appenders = [{
      type: 'console',
      pattern: '%[%r (%x{pid}) %p %c -%] %m%n',
      tokens: {
        pid: () => process.pid,
      },
    }];
    if(typeof filename === 'string') {
      appenders.push({
        type: 'file',
        filename,
        category: prodAlias,
        layout: {
          type: 'colored',
        },
      });
    }

    log4js.configure({
      appenders,
    });

    this.loggerProd = log4js.getLogger(prodAlias);
    this.loggerProd.setLevel(this.logLevel);
  }

  setPathOffset(offset) {
    this.pathOffset = offset;
  }

  setForceAlias(bool) {
    this.forceAlias = bool;
  }

  t(...args) {
    this.generateCallback('trace')(args);
  }

  d(...args) {
    this.generateCallback('debug')(args);
  }

  e(...args) {
    this.generateCallback('error')(args);
  }

  w(...args) {
    this.generateCallback('warn')(args);
  }

  i(...args) {
    this.generateCallback('info')(args);
  }

  f(...args) {
    const that = this;
    if(env === 'development' && !that.forceAlias) {
      that.debugLog('fatal', args);
    } else {
      that.prodLog('fatal', args);
    }
    process.exit(1);
  }

  generateCallback(level) {
    const that = this;
    return function(args) {
      if(that.logLevel !== 'off') {
        if(env === 'development' && !that.forceAlias) {
          that.debugLog(level, args);
        } else {
          that.prodLog(level, args);
        }
      }
    };
  }

  debugLog(level, args) {
    const stackOffset = level === 'fatal' ? 2 : 3;
    const origin = stack()[stackOffset];
    const log = log4js.getLogger(`${origin.getFileName().split('/').splice(__filename.split('/').length - (this.pathOffset + 3)).join('/')}:${origin.getLineNumber()}`);
    log.setLevel(this.logLevel);
    if(args.length === 1 && typeof args[0] === 'object') {
      log[level](util.inspect(args[0], {colors: true}));
    } else {
      log[level](...args);
    }
  }

  prodLog(level, args) {
    this.loggerProd[level](...args);
  }
}

module.exports = Logger;
