/**
 * Exception
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'STRING',
      required: true,
      index: true
    },

    username: {
      type: 'STRING',
      required: true
    },

    appId: {
      type: 'STRING',
      required: true
    },

    status: {
      type: 'STRING',
      required: true,
      defaultsTo: 'active'
    },

    type: {
      type: 'STRING',
      required: true
    }
  }

};
