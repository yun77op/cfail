/**
 * ExceptionOccurrence
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  attributes: {
    name: {
      type: 'STRING',
      required: true
    },
    appId: {
      type: 'STRING',
      required: true
    },
    exceptionId: {
      type: 'STRING',
      required: true
    },
    stack: 'STRING',
    username: {
      type: 'STRING',
      required: true,
      index: true
    },
    type: {
      type: 'STRING',
      required: true
    },
    path: {
      type: 'STRING',
      required: true
    },
    client_ua: 'STRING',
    client_os: 'STRING'
  }

};
