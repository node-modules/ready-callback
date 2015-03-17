# koa-ready

Launch server after all async task ready

---

[![NPM version](https://img.shields.io/npm/v/koa-ready.svg?style=flat)](https://npmjs.org/package/koa-ready)
[![Build Status](https://img.shields.io/travis/popomore/koa-ready.svg?style=flat)](https://travis-ci.org/popomore/koa-ready)
[![Build Status](https://img.shields.io/coveralls/popomore/koa-ready.svg?style=flat)](https://coveralls.io/r/popomore/koa-ready)
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

Handle error

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

Get data every task end

```
app.on('ready_stat', function(data) {
  console.log(data.id); // id of the ended task 
  console.log(data.remain); // tasks waiting to be ended 
});
```

## LISENCE

Copyright (c) 2015 popomore. Licensed under the MIT license.
