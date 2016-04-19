'use strict';

const log4js = require('log4js');
const stack = require('callsite');

const env = process.env.NODE_ENV || 'development';

class Logger {
  constructor(level, alias) {
    this.alias = alias || null;
    this.logLevel = level.toLowerCase() || 'trace';
    this.forceAlias = false;
    this.pathOffset = 0;
    this.loggerProd = log4js.getLogger(this.alias || stack()[2].getFileName().split('/').splice(__filename.split('/').length - (2 + this.pathOffset)).join('/'));
    this.loggerProd.setLevel(this.logLevel);
  }

  setPathOffset(offset) {
    this.pathOffset = offset;
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
    const that = this;
    if(env === 'development' && !that.forceAlias) {
      that.debugLog('fatal', arguments);
    } else {
      that.prodLog('fatal', arguments);
    }
    process.exit(1);
  }

  generateCallback(level) {
    const that = this;
    return function() {
      if(that.logLevel !== 'off') {
        if(env === 'development' && !that.forceAlias) {
          that.debugLog(level, arguments);
        } else {
          that.prodLog(level, arguments);
        }
      }
    };
  }

  debugLog(level, args) {
    const stackOffset = level === 'fatal' ? 2 : 3;
    const origin = stack()[stackOffset];
    const log = log4js.getLogger(`${origin.getFileName().split('/').splice(__filename.split('/').length - (this.pathOffset + 3)).join('/')}:${origin.getLineNumber()}`);
    log.setLevel(this.logLevel);
    log[level](...args);
  }

  prodLog(level, args) {
    this.loggerProd[level](...args);
  }
}

module.exports = Logger;
