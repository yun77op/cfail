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
    var user = _.pick(req.body, 'name', 'passwd');

    User.create(user).
      done(function(err) {
        if (err) {
          res.send(err, 500);
          return;
        }

        res.send({
          success: true
        });
      });
  },

  signout: function(req, res) {
    req.session.destroy();
    res.send({
      success: true
    });
  }
};
