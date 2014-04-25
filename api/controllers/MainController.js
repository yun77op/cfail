/**
 * MainController
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

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to MainController)
   */
  _config: {},

  index: function(req, res) {
    if (!req.session.authenticated) {
      res.view('home/index');
      return;
    }

    var ctx = {};

    Application.find().
      exec(function(err, applications) {
        if (err) return res.send(err, 500);

        var viewPath;

        if (applications.length == 0) {
          viewPath = 'home/index-logined-default';
        } else {
          viewPath = 'home/index-logined';
          ctx.applications = applications;
          ctx.curApp = applications[0];
        }

        res.view(viewPath, ctx);
      });
  }

  
};
