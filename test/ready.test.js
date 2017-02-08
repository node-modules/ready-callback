'use strict';

const should = require('should');
const assert = require('assert');
const EventEmitter = require('events');
const spy = require('spy');
const Ready = require('..').Ready;

describe('Ready', function() {

  describe('without arguments', function() {

    let obj,
      ready;
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
        spyReady.callCount.should.eql(2);
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
        spyReady.callCount.should.eql(2);
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
        spyReady.callCount.should.eql(2);
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
        spyReady.callCount.should.eql(0);
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
        spyError.callCount.should.eql(2);
        spyReady.callCount.should.eql(2);
        assert(spyReady.calls[0].arguments[0].message === 'aaa');
        assert(spyReady.calls[1].arguments[0].message === 'aaa');
        done();
      }, 20);
    });

    it('should fire readyCallback only once', function(done) {
      const spyReady = spy();
      const spyError = spy();

      const endA = obj.readyCallback('a');
      setTimeout(function() {
        const err = new Error('error');
        endA(err);
        endA(err);
      }, 1);

      obj.on('error', spyError);
      obj.ready(spyReady);

      setTimeout(function() {
        spyError.callCount.should.eql(1);
        spyReady.called.should.be.false;
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
        spyError.callCount.should.eql(1);
        spyReady.callCount.should.eql(1);
        assert(spyReady.calls[0].arguments[0].message === 'error');
        // obj._readyCache.should.eql(['a', 'b']);
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
        spyReady.callCount.should.eql(2);
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
        timeout.should.eql([ 'e' ]);
        data.should.eql([{
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
        spyReady.callCount.should.eql(1);
        spyTimeout.callCount.should.eql(2);
        spyTimeout.calledWith('a').should.be.true;
        spyTimeout.calledWith('d').should.be.true;
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
        spyReady.callCount.should.eql(1);
        spyTimeout.callCount.should.eql(2);
        spyTimeout.calledWith('a').should.be.true;
        spyTimeout.calledWith('c').should.be.true;
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
        spyReady.callCount.should.eql(1);
        spyTimeout.called.should.be.false;
        done();
      }, 100);
    });

  });

  describe('weakDep', function() {

    let obj,
      ready;

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
        spyError.called.should.be.false;
        spyReady.callCount.should.eql(2);
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
      endA(new Error('error'));

      const endB = obj.readyCallback('b');
      setTimeout(endB, 10);

      obj.on('error', spyError);
      obj.ready(spyReady);

      setTimeout(function() {
        spyError.callCount.should.eql(1);
        spyReady.called.should.be.false;
        done();
      }, 20);
    });
  });

  it('should not throw when mixin an object that do not support events', function(done) {
    const obj = {};
    const ready = new Ready();
    ready.mixin(obj);

    const spyReady = spy();
    const spyError = spy();
    const end = obj.readyCallback('a');
    end(new Error());

    ready.ready(spyReady);
    ready.on('error', spyError);
    should.not.exists(obj.on);
    obj.ready(spyReady);

    setTimeout(function() {
      spyReady.called.should.be.false;
      spyError.callCount.should.eql(1);
      done();
    }, 10);
  });

  it('should mixin only once', function() {
    const ready = new Ready();
    should.not.exists(ready.obj);

    ready.mixin();
    should.not.exists(ready.obj);

    const obj1 = {},
      obj2 = {};
    ready.mixin(obj1);
    ready.obj.should.equal(obj1);

    ready.mixin(obj2);
    ready.obj.should.equal(obj1);
    ready.obj.should.not.equal(obj2);
  });
});
