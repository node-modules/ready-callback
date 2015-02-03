var ready = require('ready');

module.exports = function(app) {
  app = app || {};
  return app.ready = new Ready();
};

function Ready() {
  this.cache = {};
}

ready.mixin(Ready.prototype);

var proto = Ready.prototype;

/*
  For async launch service

  id: unique id for one service
  isWeakDep:  ,defalt: false
*/

proto.async = function(id, isWeakDep) {
  if (!id) throw new Error('Should specify id');
  isWeakDep = isWeakDep === true;

  if (this.cache[id]) {
    throw new Error('Can not register id `' + id + '` twice');
  }

  var that = this;
  return this.cache[id] = function(err) {

  };
};
