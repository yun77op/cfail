/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

var encryptPassword = function(values, next) {
  bcrypt.hash(values.passwd, 10, function(err, hash) {
    if(err) return next(err);
    values.passwd = hash;
    next();
  });
};

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
      bcrypt.compare(password, this.passwd, cb);
    }
  },

  // Lifecycle Callbacks
  beforeCreate: encryptPassword,

  beforeUpdate: encryptPassword

};
