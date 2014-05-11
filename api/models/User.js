/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

module.exports = {

  autoPK: true,

  attributes: {
    name: {
      type: 'email',
      required: true,
      unique: true
    },
    passwd: {
      type: 'STRING',
      minLength: 6,
      required: true,
      columnName: 'encrypted_passwd'
    },

    emailVerified: {
      type: 'boolean',
      required: true,
      defaultsTo: false
    },

    secret: {
      type: 'STRING',
      required: true,
      unique: true
    },

    authenticate: function(password, cb) {
      var hashedPassword = this.passwd;
      User.encrypt(password, function(err, hash) {
        if (err) return cb(err);
        cb(null, hashedPassword === hash);
      });
    }
  },

  encrypt: function(password, cb) {
    bcrypt.hash(password, 10, cb);
  },

  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
    User.encrypt(values.passwd, function(err, hash) {
      if(err) return next(err);
      values.passwd = hash;
      next();
    });
  }

};
