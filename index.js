'use strict';

var debug = require('debug')('koa-ready');
var ready = require('ready');

module.exports = function(app) {
  if (!app) return;

  // unique ready id for app
  app._ready_hash_id = app._ready_hash_id || Date.now();

  // inject async method
  app.async = async;

  // inject ready method
  ready.mixin(app);

  setImmediate(function () {
    // 如果没有任何任务, 则触发 ready
    if (!app._readyCache) {
      debug('[%s] Fire callback directly', app._ready_hash_id);
      app.ready(true);
    }
  });
};

/*
  Create a async task

  - id: unique id for one task
  - opt
    - isWeakDep: whether it's a weak dependency, default: false
    - timeout: emit `ready_timeout` when it's over timeout, default: 10000ms
*/

function async(id, opt) {
  opt || (opt = {});

  /* jshint validthis:true */
  var self = this;

  if (!id) {
    throw new Error('Should specify id');
  }

  var isWeakDep = opt.isWeakDep === true;
  var timeout = opt.timeout || 10000;

  var cache = self._readyCache = self._readyCache || [];
  var hashId = self._ready_hash_id;

  if (cache.indexOf(id) > -1) {
    throw new Error('Can not register id `' + id + '` twice');
  }

  debug('[%s] Register task id `%s`, isWeakDep %s', hashId, id, isWeakDep);
  cache.push(id);

  var timer = setTimeout(this.emit.bind(this, 'ready_timeout', id), timeout);

  return once(function(err) {
    clearTimeout(timer);

    if (self._readyError === true) return;
    // fire callback after all register
    setImmediate(function() {
      if (err && !isWeakDep) {
        self._readyError = true;
        debug('[%s] Throw error task id `%s`, error %s', hashId, id, err);
        return self.emit('error', err);
      }

      debug('[%s] End task id `%s`, error %s', hashId, id, err);
      cache.splice(cache.indexOf(id), 1);

      self.emit('ready_stat', {
        id: id,
        remain: cache.slice()
      });

      if (cache.length === 0) {
        debug('[%s] Fire callback async', hashId);
        self.ready(true);
      }
    });
  });
}

function once(fn) {
  var isCalled = false;
  return function(err) {
    if (isCalled) return;
    isCalled = true;
    fn(err);
  };
}
