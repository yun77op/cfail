/**
 * Staged
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {

    appId: {
      type: 'string',
      required: true
    },

    appName: {
      type: 'string',
      required: true
    },

    userId: {
      type: 'string',
      required: true
    },

    userName: {
      type: 'email',
      required: true
    },

    role: {
      type: 'string',
      required: true,
      in: ['admin', 'collaborator'],
      defaultsTo: 'collaborator'
    }
    
  }

};
