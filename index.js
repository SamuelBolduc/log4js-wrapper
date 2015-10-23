'use strict';

const log4js = require('log4js');
const stack = require('callsite');

const env = process.env.NODE_ENV || 'development';

class Logger {
  constructor(level, alias) {
    this.alias = alias || null;
    this.level = level || 'trace';
    this.forceAlias = false;
    this.loggerProd = log4js.getLogger(this.alias || stack()[2].getFileName().split('/').splice(__filename.split('/').length - 2).join('/'));
    this.loggerProd.setLevel(this.logLevel);
  }

  setForceAlias(bool) {
    this.forceAlias = bool;
  }

  t() {
    this.generateCallback('trace')(...arguments);
  }

  d() {
    this.generateCallback('debug')(...arguments);
  }

  e() {
    this.generateCallback('error')(...arguments);
  }

  w() {
    this.generateCallback('warn')(...arguments);
  }

  i() {
    this.generateCallback('info')(...arguments);
  }

  f() {
    if(env === 'development') {
      this.debugLog('fatal', arguments);
    } else {
      this.prodLog('fatal', arguments);
    }
    process.exit(1);
  }

  generateCallback(level) {
    const that = this;
    return function() {
      if(env === 'development' && !that.forceAlias) {
        that.debugLog(level, arguments);
      } else {
        that.prodLog(level, arguments);
      }
    };
  }

  debugLog(level, args) {
    const origin = stack()[3];
    const log = log4js.getLogger(`${origin.getFileName().split('/').splice(__filename.split('/').length - 2).join('/')}:${origin.getLineNumber()}`);
    log.setLevel(this.logLevel);
    log[level](...args);
  }

  prodLog(level, args) {
    this.loggerProd[level](...args);
  }
}

module.exports = Logger;
