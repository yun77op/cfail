/**
 * Created by yun77op on 5/4/14.
 */

module.exports = function(req, res, next) {
  req.body.userId = req.session.user.id;
  next();
};
