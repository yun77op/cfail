/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

const
  crypto = require('crypto');

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  var app = sails.express.app;

  app.locals.generateComponent = function(prefix) {
    var id = (prefix || 'component') + '-' +  crypto.randomBytes(16).toString('base64');
    return {
      id: id,
      getChildElementIdByName: function(childElementName) {
        return id + '-' + childElementName;
      }
    };
  };

  app.locals.appDebug = sails.config.environment == 'development';

  cb();
};