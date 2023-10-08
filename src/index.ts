import EventEmitter from 'node:events';
import { debuglog } from 'node:util';
import { randomUUID } from 'node:crypto';
import once from 'once';
import ReadyObject = require('get-ready');
import { type ReadyFunctionArg } from 'get-ready';

const debug = debuglog('ready-callback');

interface ReadyOption {
  timeout?: number;
  isWeakDep?: boolean;
  lazyStart?: boolean;
}
interface ReadyCallbackOption {
  name?: string;
  timeout?: number;
  isWeakDep?: boolean;
}
interface ReadyCallbackFn {
  (err?: any): void;
  id: string;
}
type ReadyCallbackCache = Map<string, ReadyCallbackFn>;

const defaults: ReadyCallbackOption = {
  timeout: 10000,
  isWeakDep: false,
};

/**
 * @class Ready
 */
class Ready extends EventEmitter {
  isError = false;
  cache: ReadyCallbackCache = new Map();

  opt: ReadyOption;
  obj: any;

  ready: (flagOrFunction?: ReadyFunctionArg) => void;

  constructor(opt: ReadyOption = {}) {
    super();
    ReadyObject.default.mixin(this);

    this.opt = opt;

    if (!this.opt.lazyStart) {
      this.start();
    }
  }

  start() {
    setImmediate(() => {
      // fire callback directly when no registered ready callback
      if (this.cache.size === 0) {
        debug('Fire callback directly');
        this.ready(true);
      }
    });
  }

  /**
   * Mix `ready` and `readyCallback` to `obj`
   * @function Ready#mixin
   * @param  {Object} obj - The mixed object
   * @return {Ready} this
   */
  mixin(obj?: any) {
    // only mixin once
    if (!obj || this.obj) return null;

    // delegate API to object
    obj.ready = this.ready.bind(this);
    obj.readyCallback = this.readyCallback.bind(this);

    // only ready once with error
    this.once('error', err => obj.ready(err));

    // delegate events
    if (obj.emit) {
      this.on('ready_timeout', obj.emit.bind(obj, 'ready_timeout'));
      this.on('ready_stat', obj.emit.bind(obj, 'ready_stat'));
      this.on('error', obj.emit.bind(obj, 'error'));
    }
    this.obj = obj;

    return this;
  }

  readyCallback(name: string, opt: ReadyCallbackOption = {}) {
    opt = Object.assign({}, defaults, this.opt, opt);
    const cacheKey = randomUUID();
    opt.name = name || cacheKey;
    const timer = setTimeout(() => this.emit('ready_timeout', opt.name), opt.timeout);
    const cb = once((err?: any) => {
      if (err != null && !(err instanceof Error)) {
        err = new Error(err);
      }
      clearTimeout(timer);
      // won't continue to fire after it's error
      if (this.isError === true) return;
      // fire callback after all register
      setImmediate(() => this.readyDone(cacheKey, opt, err));
    }) as unknown as ReadyCallbackFn;
    debug('[%s] Register task id `%s` with %j', cacheKey, opt.name, opt);
    cb.id = opt.name;
    this.cache.set(cacheKey, cb);
    return cb;
  }

  readyDone(id: string, opt: ReadyCallbackOption, err?: Error) {
    if (err != null && !opt.isWeakDep) {
      this.isError = true;
      debug('[%s] Throw error task id `%s`, error %s', id, opt.name, err);
      return this.emit('error', err);
    }

    debug('[%s] End task id `%s`, error %s', id, opt.name, err);
    this.cache.delete(id);

    this.emit('ready_stat', {
      id: opt.name,
      remain: getRemain(this.cache),
    });

    if (this.cache.size === 0) {
      debug('[%s] Fire callback async', id);
      this.ready(true);
    }
    return this;
  }
}

function getRemain(map: ReadyCallbackCache) {
  const names: string[] = [];
  for (const cb of map.values()) {
    names.push(cb.id);
  }
  return names;
}

export { Ready };

export default function(opt: ReadyOption = {}) {
  return new Ready(opt);
}
