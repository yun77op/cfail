"use strict";

var wscli = require('../../lib/wsapi_client');

var context = exports.context = {};
var configuration = exports.configuration = { url: 'http://localhost:1337' };


exports.get = function(path, getArgs, ctx, cb) {
  return function() {
    wscli.get(configuration, path, getArgs, ctx || context, (cb || this.callback).bind(this));
  };
};

exports.post = function(path, postArgs, ctx, cb) {
  return function() {
    wscli.post(configuration, path, postArgs, ctx || context, (cb || this.callback).bind(this));
  };
};
