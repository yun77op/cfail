/**
 * UserController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var _ = require('lodash');
var deferred = require('deferred');
var httputils = require('../../lib/httputils');
var secrets = require('../../lib/secrets');
var email = require('../../lib/mail');

module.exports = {
    
  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {},


  login: function(req, res) {
    var name = req.param('name');
    var passwd = req.param('passwd');
    User.findByName(name).
      done(function(err, users) {
        if (err) {
          res.send(err, 500);
          return;
        }

        if (users.length == 0) {
          res.send({
            success: false,
            error_code: -1,
            error_message: 'User is not validated'
          });
          return;
        }

        var user = users[0];

        req.session.user = _.pick(user, 'id', 'name');
        req.session.authenticated = true;
        res.redirect('/');
      });
  },

  signup: function(req, res) {
    var user = _.pick(req.body, 'name', 'passwd', 'role', 'appId');
    var explicitPassword;

    if (user.role === 'collaborator') {
      explicitPassword = secrets.weakGenerate(8);
      user.passwd = explicitPassword;
    }

    var secret = secrets.weakGenerate(24);
    user.secret = secret;

    User.create(user).
      done(function(err, user) {
        if (err) {
          res.serverError(err);
          return;
        }

        // Send verification email
        email.sendNewUserEmail(user.name, secret, { explicitPassword: explicitPassword });

        httputils.success(res, { user: user });
      });
  },

  signout: function(req, res) {
    req.session.destroy();
    httputils.success(res);
  },

  destroy: function(req, res) {
    sails.log.info('UserController: destroy user ' + req.body.id);

    User.destroy({
      id: req.body.id
    }).done(function(err) {
        if (err) return res.serverError(err);
        httputils.success(res);
      });
  },

  verify_email_address: function(req, res) {
    var token = req.query.token;

    User.findOne({ secret: token }).
      then(function(user) {
        if (!!user) {
          user.emailVerified = true;

          // method model.save returns undefined, not promise
          var def = deferred();
          user.save(function(err, user) {
            if (err) def.reject(err);
            else def.resolve(true);
          });

          return def.promise;
        }

        return false;
      }).
      done(function(success) {
        var ctx = {};

        ctx.message = !success ? 'Could\'t complete email verification' : 'Success';
        ctx.success = success;

        res.view('user/confirm', ctx);
      }, function(err) {
        res.serverError(err)
      });
  }
};
