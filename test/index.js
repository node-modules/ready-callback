'use strict';

require('should');
var koa = require('koa');
var spy = require('spy');
var ready = require('..');

describe('koa-ready', function() {

  var app;
  beforeEach(function() {
    app = koa();
    ready(app);
  });

  it('should fire the callback when no task', function(done) {
    var spyReady = spy();

    app.ready(spyReady);

    setTimeout(function() {
      spyReady.callCount.should.eql(1);
      done();
    }, 10);
  });

  it('should fire the callback after sync call', function(done) {
    var spyReady = spy();

    var endA = app.async('a');
    endA();
    var endB = app.async('b');
    endB();

    app.ready(spyReady);

    setTimeout(function() {
      spyReady.callCount.should.eql(1);
      done();
    }, 10);
  });

  it('should fire the callback after async call', function(done) {
    var spyReady = spy();

    var endA = app.async('a');
    var endB = app.async('b');
    var endC = app.async('c');
    var endD = app.async('d');
    setTimeout(endA, 1);
    setTimeout(endB, 80);
    setTimeout(endC, 10);
    setTimeout(endD, 50);

    app.ready(spyReady);

    setTimeout(function() {
      spyReady.callCount.should.eql(1);
      done();
    }, 100);
  });

  it('should emit error when one of the task fail', function(done) {
    var spyError = spy();
    var spyReady = spy();

    var endA = app.async('a');
    endA(new Error('aaa'));

    var endB = app.async('b');
    setTimeout(endB, 10);

    app.on('error', spyError);
    app.ready(spyReady);

    setTimeout(function() {
      spyError.called.should.be.true;
      spyReady.called.should.be.false;
      done();
    }, 20);
  });

  it('should fire the callback when weakDep', function(done) {
    var spyError = spy();
    var spyReady = spy();

    var endA = app.async('a', true);
    endA(new Error('error'));

    var endB = app.async('b');
    setTimeout(endB, 10);

    app.on('error', spyError);
    app.ready(spyReady);

    setTimeout(function() {
      spyError.called.should.be.false;
      spyReady.called.should.be.true;
      done();
    }, 20);
  });

  it('should fire endTask only once', function(done) {
    var spyReady = spy();
    var spyError = spy();

    var endA = app.async('a');
    setTimeout(function() {
      var err = new Error('error');
      endA(err);
      endA(err);
    }, 1);

    app.on('error', spyError);
    app.ready(spyReady);

    setTimeout(function() {
      spyError.callCount.should.eql(1);
      spyReady.called.should.be.false;
      done();
    }, 10);
  });

  it('should not fire endTask after throw error', function(done) {
    var spyReady = spy();
    var spyError = spy();

    var endA = app.async('a');
    var endB = app.async('b');
    setTimeout(function() {
      endA(new Error('error'));
    }, 1);
    setTimeout(endB, 10);

    app.on('error', spyError);
    app.ready(spyReady);

    setTimeout(function() {
      spyError.callCount.should.eql(1);
      spyReady.callCount.should.eql(0);
      app._readyCache.should.eql(['a', 'b']);
      done();
    }, 20);
  });

  it('should error when no argument to async', function() {
    (function() {
      app.async();
    }).should.throw('Should specify id');
  });

  it('should error when async is fired twice with one id', function() {
    (function() {
      app.async('a');
      app.async('a');
    }).should.throw('Can not register id `a` twice');
  });

  it('should return when no argument', function() {
    ready();
  });
});
