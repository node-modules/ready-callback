'use strict';

const assert = require('assert');
const koa = require('koa');
const spy = require('spy');
const ready = require('..');

describe('koa', function() {

  let app;
  beforeEach(function() {
    app = koa();
    ready().mixin(app);
  });

  it('should fire the callback after readyCallback call', function(done) {
    const spyReady = spy();

    const endA = app.readyCallback('a');
    const endB = app.readyCallback('b');
    const endC = app.readyCallback('c');
    const endD = app.readyCallback('d');
    setTimeout(endA, 1);
    setTimeout(endB, 80);
    setTimeout(endC, 10);
    setTimeout(endD, 50);

    app.ready(spyReady);

    setTimeout(function() {
      assert(spyReady.callCount === 1);
      done();
    }, 100);
  });

});
