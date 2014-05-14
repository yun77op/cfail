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
    var body = req.body;
    var name = body.name;

    User.findOneByName(name).
      done(function(err, user) {
        if (err) return res.serverError(err);

        if (!user) {
          res.send({
            success: false,
            error_code: -1,
            error_message: 'User is not found'
          });
          return;
        }

        if (!user.emailVerified) {
          res.send({
            success: false,
            error_message: 'Email is not verified'
          });
          return;
        }

        user.authenticate(body.passwd, function(err, authenticted) {
          if (err) return res.serverError(err);

          if (!authenticted) {
            res.send({
              success: false,
              error_message: 'Username does not match password'
            });
            return;
          }

          req.session.user = _.pick(user, 'id', 'name');
          req.session.authenticated = true;
          httputils.success(res);
        });
      });
  },

  addCollaborator: function(req, res) {
    var body = req.body;
    var name = body.name;
    var explicitPassword = null;

    User.findOneByName(name).
      then(function(aUser) {
        if (aUser) return aUser;

        explicitPassword = secrets.weakGenerate(8);

        var user = {
          name: name,
          passwd: explicitPassword,
          secret: secrets.weakGenerate(24)
        };

        return User.create(user);
      }).
      then(function(user) {

        // Send verification email, carried with the generated password
        var locals = {
          explicitPassword: explicitPassword,
          inviter: req.session.user.name,
          name: user.name,
          appName: body.appName
        };
        email.sendInviteCollaboratorEmail(user.name, user.secret, locals);

        var staged = {
          appName: body.appName,
          appId: body.appId,
          role: 'collaborator',
          userId: user.id,
          userName: user.name
        };
        return Staged.create(staged);
      }).
      done(function(staged) {
        httputils.success(res, { staged: staged });
      }, function(err) {
        res.serverError(err);
      });

  },

  signup: function(req, res) {
    var user = _.pick(req.body, 'name', 'passwd');
    user.secret = secrets.weakGenerate(24);

    User.create(user).
      done(function(err, user) {
        if (err) {
          res.send({
            success: false,
            error: err
          });
          return;
        }

        // Send verification email
        email.sendNewUserEmail(user.name, user.secret);

        if (req.wantsJSON) {
          httputils.success(res, { user: user });
        } else {
          res.redirect('/login');
        }
        if (req.wantsJSON) {
          httputils.success(res, { user: user });
        } else {
          res.redirect('/login');
        }
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

  changePassword: function(req, res) {
    var body = req.body;

    User.findOne(body.userId).
      then(function(user) {
        user.authenticate(body.password, function(err, authenticated) {
          if (err) return res.serverError(err);
          if (!authenticated) {
            return httputils.error(res, 'Password is not correct');
          }

          user.passwd = body.newPassword;

          user.save(function(err, user) {
            if (err) return res.serverError(err);

            httputils.success(res, { user: user });
          });
        });
      }, function(err) {
        res.serverError(err);
      });
  },

  verify_email_address: function(req, res) {
    var token = req.query.token;

    User.findOne({ secret: token }).
      then(function(user) {
        if (!!user) {
          user.emailVerified = true;

          // method model.save returns undefined, not promise, so bad.
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
