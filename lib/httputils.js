
var _ = require('lodash');

exports.success = function(res, data) {
  data = _.defaults({}, data, { success: true });
  res.send(data);
};

