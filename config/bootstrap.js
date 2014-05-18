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
  email = require('../lib/mail');

module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  var app = sails.express.app;

  var baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    // sails has `getBaseurl` method at version 0.10
    var usingSSL = (
      (
        sails.config.serverOptions &&
          sails.config.serverOptions.key &&
          sails.config.serverOptions.cert
        ) || (
        sails.config.express &&
          sails.config.express.serverOptions &&
          sails.config.express.serverOptions.key &&
          sails.config.express.serverOptions.cert
        )
      );
    baseUrl = ( usingSSL ? 'https' : 'http' ) + '://' + sails.config.host + ':' + sails.config.port + '';
  }

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
  app.locals.baseUrl = baseUrl;

  // set email service config
  email.setConfig({
    log: sails.log,
    email_to_console: sails.config.email_to_console,
    baseUrl: baseUrl,
    mail: sails.config.mail
  });

  cb();
};