# koa-ready

Launch server after all async task ready

---

[![NPM version](https://img.shields.io/npm/v/koa-ready.svg?style=flat)](https://npmjs.org/package/koa-ready)
[![Build Status](https://img.shields.io/travis/koajs/koa-ready.svg?style=flat)](https://travis-ci.org/koajs/koa-ready)
[![Build Status](https://img.shields.io/coveralls/koajs/koa-ready.svg?style=flat)](https://coveralls.io/r/koajs/koa-ready)
[![NPM downloads](http://img.shields.io/npm/dm/koa-ready.svg?style=flat)](https://npmjs.org/package/koa-ready)

## Install

```
$ npm install koa-ready -g
```

## Usage

```
var koa = require('koa');
var ready = require('koa-ready');
var app = koa();
ready(app);

// register a service
var done = app.async('service');
serviceLaunch(done);

// callback will be fired after all service launched
app.ready(function() {
  app.listen();
});
```

### Error Handle

If task is called with error, `error` event will be emit, `ready` will never be called.

```
// register a service that will emit error
var done = app.async('service');
serviceLaunch(function(err) {
  done(err);
});

// listen error event
app.on('error', function(err) {
  // catch error
});
```

### Weak Dependency

If you set a task weak dependency, task will be done without emit `error`.

```
var done = app.async('service', {isWeakDep: true});
serviceLaunch(function(err) {
  done(err);
});

// will be ready
app.ready(function() {
  app.listen();
});

app.on('error', function(err) {
  // never be called
});
```

### Ready Status

You can get status every task end.

```
app.on('ready_stat', function(data) {
  console.log(data.id); // id of the ended task 
  console.log(data.remain); // tasks waiting to be ended 
});
```

### Timeout

You can set timeout when a task run a long time.

```
ready(app, {timeout: 1000});
app.on('ready_timeout', function(id) {
  // this will be called after 1s that `service` task don't complete
});

var done = app.async('service');
serviceLaunch(function() {
  // run a long time
  done();
});
```

You can also set timeout for every task

```
ready(app);
app.on('ready_timeout', function(id) {
  // this will be called after 1s that `service` task don't complete
});

var done = app.async('service1', {timeout: 1000});
serviceLaunch(done);
```

## LISENCE

Copyright (c) 2015 popomore. Licensed under the MIT license.
