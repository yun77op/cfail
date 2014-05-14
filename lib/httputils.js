
var _ = require('lodash');

exports.success = function(res, data) {
  data = _.defaults({}, data, { success: true });
  res.send(data);
};

exports.error = function(res, data) {
  if (typeof data == 'string') {
    data = new Error(data);
    data.err = data.message;
  }

  res.send({
    success: false,
    error: data
  })
};