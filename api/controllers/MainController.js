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

    var render = function(stagedList) {
      var viewPath;
      var ctx = {};

      if (stagedList.length == 0) {
        viewPath = 'home/index-logined-default';
      } else {
        viewPath = 'home/index-logined';
        ctx.stagedList = stagedList;
      }

      res.view(viewPath, ctx);
    };

    if (req.session.user.id === 'demo') {
      render([{
        id: 'demo',
        userId: 'demo',
        userName: 'demo@example.com',
        role: 'admin',
        appId: 'demo',
        appName: 'demo'
      }]);
      return;
    }

    Staged.findByUserId(req.session.user.id).
      done(function(err, stagedList) {
        if (err) return res.send(err, 500);

        render(stagedList);
      });
  },

  demo: function(req, res) {
    req.session.user = { id: 'demo', name: 'demo@example.com' };
    req.session.authenticated = true;
    res.redirect('/');
  }
  
};
