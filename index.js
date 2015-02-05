'use strict';

var debug = require('debug')('koa-ready');
var ready = require('ready');

module.exports = function(app) {
  if (!app) return;

  // inject async method
  app.async = async;

  // inject ready method
  ready.mixin(app);

  setImmediate(function () {
    // 如果没有任何任务, 则触发 ready
    if (!app._readyCache) {
      debug('Fire callback directly');
      app.ready(true);
    }
  });
};

/*
  Create a async task

  id: unique id for one task
  isWeakDep: whether it's a weak dependency, default: false
*/

function async(id, isWeakDep) {
  /* jshint validthis:true */
  var self = this;

  if (!id) {
    throw new Error('Should specify id');
  }
  isWeakDep = isWeakDep === true;

  self._readyCache = self._readyCache || {};

  if (self._readyCache[id]) {
    throw new Error('Can not register id `' + id + '` twice');
  }

  debug('Register task id %s, isWeakDep %s', id, isWeakDep);
  var endTask = self._readyCache[id] = once(function(err) {
    if (self._readyError === true) return;

    // fire callback after all register
    setImmediate(function() {
      if (err && !isWeakDep) {
        self._readyError = true;
        debug('Throw error task id %s, error %s', id, err);
        return self.emit('error', err);
      }

      debug('End task id %s, error %s', id, err);
      delete self._readyCache[id];

      if (Object.keys(self._readyCache).length === 0) {
        debug('Fire callback async');
        self.ready(true);
      }
    });
  });

  return endTask;
}

function once(fn) {
  var isCalled = false;
  return function(err) {
    if (isCalled) return;
    isCalled = true;
    fn(err);
  };
}
