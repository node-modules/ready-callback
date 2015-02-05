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
    app.ready(function() {
      done();
    });
  });

  it('should fire the callback after sync call', function(done) {
    var spyA = spy();
    var spyB = spy();

    var endA = app.async('a');
    (function() {
      spyA();
      endA();
    })();

    var endB = app.async('b');
    (function() {
      spyB();
      endB();
    })();

    app.ready(function() {
      spyA.called.should.be.true;
      spyB.called.should.be.true;
      done();
    });
  });

  it('should fire the callback after async call', function(done) {
    var endA = app.async('a');
    var endB = app.async('b');
    var endC = app.async('c');
    var endD = app.async('d');
    var spyA = spy();
    var spyB = spy();
    var spyC = spy();
    var spyD = spy();
    setTimeout(function() {
      spyA();
      endA();
    }, 1);
    setTimeout(function() {
      spyB();
      endB();
    }, 100);
    setTimeout(function() {
      spyC();
      endC();
    }, 10);
    setTimeout(function() {
      spyD();
      endD();
    }, 50);
    app.ready(function() {
      spyA.called.should.be.true;
      spyB.called.should.be.true;
      spyC.called.should.be.true;
      spyD.called.should.be.true;
      done();
    });
  });

  it('should emit error when one of the task fail', function(done) {
    var spyError = spy();
    var spyReady = spy();

    var endA = app.async('a');
    (function() {
      endA(new Error('aaa'));
    })();

    var endB = app.async('b');
    setTimeout(function() {
      endB();
    }, 10);

    app.on('error', function() {
      spyError();
    });

    app.ready(function() {
      spyReady();
    });

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
    (function() {
      endA(new Error('aaa'));
    })();

    var endB = app.async('b');
    setTimeout(function() {
      endB();
    }, 10);

    app.on('error', function() {
      spyError();
    });

    app.ready(function() {
      spyReady();
    });

    setTimeout(function() {
      spyError.called.should.be.false;
      spyReady.called.should.be.true;
      done();
    }, 20);
  });

  it.only('should fire endTask only once', function(done) {
    var spyError = spy();
    var endA = app.async('a');
    app.on('error', spyError);

    setTimeout(function() {
      var err = new Error('error');
      endA(err);
      endA(err);
    }, 1);

    setTimeout(function() {
      spyError.callCount.should.eql(1);
      done();
    }, 10);
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
