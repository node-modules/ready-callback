'use strict';

const assert = require('assert');
const EventEmitter = require('events');
const spy = require('spy');
const Ready = require('..').Ready;

describe('Ready', function() {

  describe('without arguments', function() {

    let obj;
    let ready;
    beforeEach(function() {
      obj = new EventEmitter();
      ready = new Ready();
      ready.mixin(obj);
    });

    it('should fire the callback when no task', function(done) {
      const spyReady = spy();
      obj.ready(spyReady);
      ready.ready(spyReady);

      setTimeout(function() {
        assert(spyReady.callCount === 2);
        done();
      }, 10);
    });

    it('should fire the callback after sync call', function(done) {
      const spyReady = spy();

      const endA = obj.readyCallback('a');
      endA();
      const endB = obj.readyCallback('b');
      endB();

      obj.ready(spyReady);
      ready.ready(spyReady);

      setTimeout(function() {
        assert(spyReady.callCount === 2);
        done();
      }, 10);
    });

    it('should fire the callback after readyCallback call', function(done) {
      const spyReady = spy();

      const endA = obj.readyCallback('a');
      const endB = obj.readyCallback('b');
      const endC = obj.readyCallback('c');
      const endD = obj.readyCallback('d');
      setTimeout(endA, 1);
      setTimeout(endB, 80);
      setTimeout(endC, 10);
      setTimeout(endD, 50);

      ready.ready(spyReady);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyReady.callCount === 2);
        done();
      }, 100);
    });

    it('should not fire the callback when one of the callback has not been called', function(done) {
      const spyReady = spy();

      const endA = obj.readyCallback('a');
      // callback b has not been called
      obj.readyCallback('b');
      setTimeout(endA, 1);

      obj.ready(spyReady);
      ready.ready(spyReady);

      setTimeout(function() {
        assert(spyReady.callCount === 0);
        done();
      }, 20);

    });

    it('should emit error when one of the task fail', function(done) {
      const spyError = spy();
      const spyReady = spy();

      const endA = obj.readyCallback('a');
      endA(new Error('aaa'));

      const endB = obj.readyCallback('b');
      setTimeout(endB, 10);

      ready.on('error', spyError);
      obj.on('error', spyError);
      ready.ready(spyReady);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyError.callCount === 2);
        assert(spyReady.callCount === 2);
        assert(spyReady.calls[0].arguments[0].message === 'aaa');
        assert(spyReady.calls[1].arguments[0].message === 'aaa');
        done();
      }, 20);
    });

    it('should fire readyCallback only once', function(done) {
      const spyReady = spy();
      const spyError = spy();

      const endA = obj.readyCallback('a');
      const err = new Error('error');
      setTimeout(function() {
        endA(err);
        endA(err);
      }, 1);

      obj.on('error', spyError);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyError.callCount === 1);
        assert(spyReady.callCount === 1);
        assert(spyReady.calledWith(err));
        done();
      }, 10);
    });

    it('should not fire readyCallback after throw error', function(done) {
      const spyReady = spy();
      const spyError = spy();

      const endA = obj.readyCallback('a');
      const endB = obj.readyCallback('b');
      setTimeout(function() {
        endA(new Error('error'));
      }, 1);
      setTimeout(endB, 10);

      obj.on('error', spyError);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyError.callCount === 1);
        assert(spyReady.callCount === 1);
        assert(spyReady.calls[0].arguments[0].message === 'error');
        done();
      }, 20);
    });

    it('should work when readyCallback without name', function(done) {
      const spyReady = spy();

      const endA = obj.readyCallback();
      endA();
      const endB = obj.readyCallback();
      endB();

      obj.ready(spyReady);
      ready.ready(spyReady);

      setTimeout(function() {
        assert(spyReady.callCount === 2);
        done();
      }, 10);
    });
  });

  describe('ready stat', function() {

    it('should emit ready_stat when every task end', function(done) {
      const obj = new EventEmitter();
      const ready = new Ready();
      ready.mixin(obj);

      const data = [];
      const timeout = [];
      obj.on('ready_stat', function(e) {
        data.push(e);
      });
      obj.on('ready_timeout', function(id) {
        timeout.push(id);
      });
      const endA = obj.readyCallback('a');
      const endB = obj.readyCallback('b');
      const endC = obj.readyCallback('c');
      const endD = obj.readyCallback('d');
      const endE = obj.readyCallback('e');
      setTimeout(endA, 1);
      setTimeout(endB, 9000);
      setTimeout(endC, 10);
      setTimeout(endD, 50);
      setTimeout(endE, 11000);

      setTimeout(function() {
        assert.deepEqual(timeout, [ 'e' ]);
        assert.deepEqual(data, [{
          id: 'a',
          remain: [ 'b', 'c', 'd', 'e' ],
        }, {
          id: 'c',
          remain: [ 'b', 'd', 'e' ],
        }, {
          id: 'd',
          remain: [ 'b', 'e' ],
        }, {
          id: 'b',
          remain: [ 'e' ],
        }, {
          id: 'e',
          remain: [],
        }]);
        done();
      }, 11200);
    });

  });

  describe('timeout', function() {

    let obj,
      ready;
    beforeEach(function() {
      obj = new EventEmitter();
      ready = new Ready();
      ready.mixin(obj);
    });

    it('should emit ready_timeout', function(done) {
      const spyTimeout = spy();
      const spyReady = spy();

      obj.on('ready_timeout', spyTimeout);
      obj.ready(spyReady);

      const endA = obj.readyCallback('a', { timeout: 50 });
      const endB = obj.readyCallback('b', { timeout: 50 });
      const endC = obj.readyCallback('c');
      const endD = obj.readyCallback('d', { timeout: 50 });
      setTimeout(endA, 100);
      setTimeout(endB, 10);
      setTimeout(endC, 1);
      setTimeout(endD, 80);

      setTimeout(function() {
        assert(spyReady.callCount === 1);
        assert(spyTimeout.callCount === 2);
        assert(spyTimeout.calledWith('a'));
        assert(spyTimeout.calledWith('d'));
        done();
      }, 150);
    });

    it('should emit ready_timeout with global timeout', function(done) {
      obj = new EventEmitter();
      ready = new Ready({ timeout: 50 });
      ready.mixin(obj);

      const spyTimeout = spy();
      const spyReady = spy();

      obj.on('ready_timeout', spyTimeout);
      obj.ready(spyReady);

      const endA = obj.readyCallback('a');
      const endB = obj.readyCallback('b');
      const endC = obj.readyCallback('c', { timeout: 0 });
      const endD = obj.readyCallback('d', { timeout: 100 });
      setTimeout(endA, 100);
      setTimeout(endB, 10);
      setTimeout(endC, 1);
      setTimeout(endD, 80);

      setTimeout(function() {
        assert(spyReady.callCount === 1);
        assert(spyTimeout.callCount === 2);
        assert(spyTimeout.calledWith('a'));
        assert(spyTimeout.calledWith('c'));
        done();
      }, 150);
    });

    it('should clearTimeout', function(done) {
      const spyTimeout = spy();
      const spyReady = spy();

      obj.on('ready_timeout', spyTimeout);
      obj.ready(spyReady);

      const endA = obj.readyCallback('a', { timeout: 50 });
      const endB = obj.readyCallback('b', { timeout: 50 });
      setTimeout(endA, 10);
      setTimeout(endB, 10);

      setTimeout(function() {
        assert(spyReady.callCount === 1);
        assert(spyTimeout.called === false);
        done();
      }, 100);
    });

  });

  describe('weakDep', function() {

    let obj;
    let ready;

    it('should fire the callback when weakDep', function(done) {
      obj = new EventEmitter();
      ready = new Ready();
      ready.mixin(obj);

      const spyError = spy();
      const spyReady = spy();

      const endA = obj.readyCallback('a', { isWeakDep: true });
      endA(new Error('error'));

      const endB = obj.readyCallback('b');
      setTimeout(endB, 10);

      ready.on('error', spyError);
      obj.on('error', spyError);
      ready.ready(spyReady);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyError.called === false);
        assert(spyReady.callCount === 2);
        done();
      }, 20);
    });

    it('should fire ready when global weakDep', function(done) {
      obj = new EventEmitter();
      ready = new Ready({ isWeakDep: true });
      ready.mixin(obj);

      const spyError = spy();
      const spyReady = spy();

      const endA = obj.readyCallback('a', { isWeakDep: false });
      const err = new Error('error');
      endA(err);

      const endB = obj.readyCallback('b');
      setTimeout(endB, 10);

      obj.on('error', spyError);
      obj.ready(spyReady);

      setTimeout(function() {
        assert(spyError.callCount === 1);
        assert(spyReady.callCount === 1);
        assert(spyReady.calledWith(err));
        done();
      }, 20);
    });
  });

  describe('error', () => {
    it('should get error in ready', done => {
      const obj = {};
      const ready = new Ready();
      ready.mixin(obj);

      const end = obj.readyCallback('a');
      obj.ready(err => {
        assert(err.message === 'error');
        done();
      });
      end(new Error('error'));
    });

    it('should ready with error after callback error', done => {
      const obj = {};
      const ready = new Ready();
      ready.mixin(obj);

      const end = obj.readyCallback('a');
      end(new Error('error'));
      obj.ready(err => {
        assert(err.message === 'error');
        done();
      });
    });

    it('should get error object when pass other type in callback', function* () {
      let err = yield assertErrorType('error');
      assert(err.message === 'error');

      err = yield assertErrorType(0);
      assert(err.message === '0');

      err = yield assertErrorType([ '1', '2' ]);
      assert(err.message === '1,2');

      err = yield assertErrorType({});
      assert(err.message === '[object Object]');

      err = yield assertErrorType(true);
      assert(err.message === 'true');

      err = yield assertErrorType(null);
      assert(err === undefined);

      function assertErrorType(value) {
        const obj = {};
        const ready = new Ready();
        ready.mixin(obj);

        const end = obj.readyCallback('a');
        end(value);
        return obj.ready().catch(err => err);
      }
    });

  });

  it('should not throw when mixin an object that do not support events', function(done) {
    const obj = {};
    const ready = new Ready();
    ready.mixin(obj);

    const spyReady = spy();
    const spyError = spy();
    const end = obj.readyCallback('a');
    const err = new Error('error');
    end(err);

    ready.ready(spyReady);
    ready.on('error', spyError);
    assert(!obj.on);
    obj.ready(spyReady);

    setTimeout(function() {
      assert(spyReady.called === true);
      assert(spyReady.calledWith(err));
      assert(spyError.callCount === 1);
      done();
    }, 10);
  });

  it('should mixin only once', function() {
    const ready = new Ready();
    assert(!ready.obj);

    ready.mixin();
    assert(!ready.obj);

    const obj1 = {},
      obj2 = {};
    ready.mixin(obj1);
    assert(ready.obj === obj1);

    ready.mixin(obj2);
    assert(ready.obj === obj1);
    assert(ready.obj !== obj2);
  });

  describe('willReady', function() {
    it('should fire willRead callbacks before ready', function(done) {
      const obj = new EventEmitter();
      const ready = new Ready();
      ready.mixin(obj);
      const endA = obj.readyCallback('a');
      const spyWillReady = spy();
      obj.willReady(spyWillReady);
      setTimeout(endA, 1);
      setTimeout(function() {
        assert.strictEqual(spyWillReady.callCount, 1);
        done();
      }, 10);
    });

    describe('willReady failed', function() {
      it('should ready error', function(done) {
        const obj = new EventEmitter();
        const ready = new Ready();
        ready.mixin(obj);
        const endA = obj.readyCallback('a');
        const willReadyThrows = function() {
          throw new Error('mock error');
        };
        obj.willReady(willReadyThrows);
        let err;
        obj.ready(function(e) {
          err = e;
        });
        setTimeout(endA, 1);
        setTimeout(function() {
          assert.strictEqual(err && err.message, 'mock error');
          done();
        }, 10);
      });
    });
  });
});
