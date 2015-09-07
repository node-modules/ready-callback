'use strict';

const Ready = require('./lib/ready');

// Use ready-callback with options
module.exports = function(opt) {
  return new Ready(opt);
};

module.exports.Ready = Ready;
