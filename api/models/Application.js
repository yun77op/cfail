/**
 * Application
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var crypto = require('crypto');

module.exports = {

  attributes: {
  	name: {
      type: 'STRING',
      required: true
    },

    userId: {
      type: 'STRING',
      required: true
    }
  }

};
