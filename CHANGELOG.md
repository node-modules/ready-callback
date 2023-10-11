# Changelog

## [4.0.0](https://github.com/node-modules/ready-callback/compare/v3.0.0...v4.0.0) (2023-10-11)


### ⚠ BREAKING CHANGES

* Drop Node.js < 16 support

closes https://github.com/node-modules/ready-callback/issues/116

part of https://github.com/eggjs/egg/issues/5257

### Features

* refactor with typescript to support esm and cjs both ([#117](https://github.com/node-modules/ready-callback/issues/117)) ([7193ec1](https://github.com/node-modules/ready-callback/commit/7193ec1e8a2f8011af1bad584683da5530e0c226))

## [3.0.0](https://github.com/node-modules/ready-callback/compare/v2.1.0...v3.0.0) (2023-01-03)


### ⚠ BREAKING CHANGES

* Drop Node.js < 14 support and reduce dependencies

### Code Refactoring

* Drop Node.js < 14 support ([#115](https://github.com/node-modules/ready-callback/issues/115)) ([f5bfa41](https://github.com/node-modules/ready-callback/commit/f5bfa414c9efe7de54b6975d4e8a22ebfbd15a25))

---

2.1.0 / 2018-08-21
==================

**features**
  * [[`37bd48f`](http://github.com/node-modules/ready-callback/commit/37bd48fe923982169d98f402a8e6bf3e5c7efc8a)] - feat: add lazyStart option (#113) (killa <<killa123@126.com>>)

2.0.1 / 2017-02-13
==================

  * fix: should not throw error when pass null (#99)

2.0.0 / 2017-02-09
==================

  * feat: call .ready(err) when callback pass an error (#98)
  * chore(package): update mocha to version 2.3.3

1.0.0 / 2015-10-20
==================

 * refactor: koa-ready rename to ready-callback

---

koa-ready histroy

## 1.0.0 / 2015-06-09

- feat: set timeout when init
- feat: add an option to set timeout when create a service

## 0.2.0 / 2015-03-17

- chore: add appveyor and use npm scrips
- feat: emit `ready_stat` when every task end
- refactor: _readyCache use array instead of object
- improve: testcase

## 0.1.1 / 2015-02-05

- fix: do not fire endTask after throw error
- fix: endTask is fired only once

## 0.1.0

First commit
