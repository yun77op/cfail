/**
 * ExceptionOccurrenceController
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
var uaParser = require('ua-parser');
var moment = require('moment');
var mongodb = require('../../lib/db/mongodb');

module.exports = {
    
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ExceptionOccurrenceController)
   */
  _config: {},

  'create': function(req, res) {
    var body = req.body;

    // TODO: First , let's verify the payload's integrity?

    var exception = _.pick(body, 'type', 'name', 'username', 'appId');

    Exception.findByName(exception.name).
      limit(1).
      then(function(exceptions) {
        if (exceptions.length == 0) {
          return Exception.create(exception);
        }
        return exceptions[0];
      }).
      then(function(exception) {
        var exceptionOccurrence = _.pick(body, 'name', 'username', 'type', 'appId', 'path');
        exceptionOccurrence.exceptionId = exception.id;
        exceptionOccurrence.stack = body.stack || '';
        var agent = body.agent || req.headers['user-agent'];

        if (agent) {
          var client = uaParser.parse(agent);
          exceptionOccurrence.client_ua = client.ua.toString();
          exceptionOccurrence.client_os = client.os.toString();
        }

        return ExceptionOccurrence.create(exceptionOccurrence);
      }).
      done(function() {
        res.send({
          success: true
        });
      }, function(err) {
        sails.log.error('Error raised when creating exceptionOccurrence: ' + err.toString());
        res.send({
          success: false,
          error: err.toString()
        });
      });
  },

  'filterByFailure': function(req, res) {

    var limit = parseInt(req.query.limit || 10, 10);
    var skip = parseInt(req.query.skip || 0, 10);

    var $match = {
      appId: req.query.appId
    };

    if (typeof req.query.type != 'undefined') {
      $match.type = req.query.type;
    }


//    sails-mongo do not support `aggregate`
//    and we have no access to sails-mongo adpater's connection,
//    so we have to open connection to mongodb directly
    mongodb.acquireConnection(sails.config.adapters.mongo, function(err, connection) {
      if (err) return res.serverError(err);

      connection.collection('exceptionoccurrence', function(err, collection) {
        if (err) return res.serverError(err);

        var aggregate = function(options, cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: { name: '$name', type: '$type', exceptionId: '$exceptionId' },
                  occurrence: { $sum: 1 },
                  createdAt: { $max: '$createdAt' }
                }
              },

              { $sort: { occurrence: -1 } },

              { $skip : options.skip },

              { $limit : options.limit },

              {
                $project: {
                  _id: 0,
                  name: '$_id.name',
                  type: '$_id.type',
                  id: '$_id.exceptionId',
                  latestOccurrenceAt: '$createdAt',
                  occurrence: 1
                }
              }
            ],

            {},

            cb);
        };

        var countTotal = function(cb) {
//          the simple approach is using `count distinct`,
//          but mongo throw exception `distinct too big` if dataset is bigger than 16MB,
//          so we prefer aggregation
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: { name: '$name', type: '$type', exceptionId: '$exceptionId' }
                }
              },

              {
                $group: {
                  _id: 0,
                  total: { $sum: 1 }
                }
              }
            ], {}, cb);
        };

        var defAggregate = deferred.promisify(aggregate);
        var defCountTotal = deferred.promisify(countTotal);

        deferred(defAggregate({ skip: skip, limit: limit }), defCountTotal()).
          then(function(resp) {
            var total = resp[1];
            total = total.length > 0 ? total[0].total : 0;

            res.send({
              list: resp[0],
              total: total
            });
          }, function(err) {
            res.serverError(err);
          });

      });
    });
  },

  'filterByUser': function(req, res) {

    var limit = parseInt(req.query.limit || 10, 10);
    var skip = parseInt(req.query.skip || 0, 10);

    var $match = {
      appId: req.query.appId
    };

    if (typeof req.query.type != 'undefined') {
      $match.type = req.query.type;
    }

    mongodb.acquireConnection(sails.config.adapters.mongo, function(err, connection) {
      if (err) return res.serverError(err);

      connection.collection('exceptionoccurrence', function(err, collection) {
        if (err) return res.serverError(err);

        var aggregate = function(options, cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: '$username',
                  occurrence: { $sum: 1 },
                  createdAt: { $max: '$createdAt' }
                }
              },

              { $sort: { occurrence: -1 } },

              { $skip : options.skip },

              { $limit : options.limit },

              {
                $project: {
                  _id: 0,
                  username: '$_id',
                  latestOccurrenceAt: '$createdAt',
                  occurrence: 1
                }
              }
            ],

            {},

            cb);
        };

        var countTotal = function(cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: '$username'
                }
              },

              {
                $group: {
                  _id: 0,
                  total: { $sum: 1 }
                }
              }
            ], {}, cb);
        };

        var defAggregate = deferred.promisify(aggregate);
        var defCountTotal = deferred.promisify(countTotal);

        deferred(defAggregate({ skip: skip, limit: limit }), defCountTotal()).
          then(function(resp) {
            var total = resp[1];
            total = total.length > 0 ? total[0].total : 0;

            res.send({
              list: resp[0],
              total: total
            });
          }, function(err) {
            res.serverError(err);
          });

      });
    });
  },

  'filterByUrl': function(req, res) {

    var limit = parseInt(req.query.limit || 10, 10);
    var skip = parseInt(req.query.skip || 0, 10);

    var $match = {
      appId: req.query.appId
    };

    if (typeof req.query.type != 'undefined') {
      $match.type = req.query.type;
    }

    mongodb.acquireConnection(sails.config.adapters.mongo, function(err, connection) {
      if (err) return res.serverError(err);

      connection.collection('exceptionoccurrence', function(err, collection) {
        if (err) return res.serverError(err);

        var aggregate = function(options, cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: '$path',
                  occurrence: { $sum: 1 },
                  createdAt: { $max: '$createdAt' }
                }
              },

              { $sort: { occurrence: -1 } },

              { $skip : options.skip },

              { $limit : options.limit },

              {
                $project: {
                  _id: 0,
                  path: '$_id',
                  latestOccurrenceAt: '$createdAt',
                  occurrence: 1
                }
              }
            ],

            {},

            cb);
        };

        var countTotal = function(cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: '$path'
                }
              },

              {
                $group: {
                  _id: 0,
                  total: { $sum: 1 }
                }
              }
            ], {}, cb);
        };

        var defAggregate = deferred.promisify(aggregate);
        var defCountTotal = deferred.promisify(countTotal);

        deferred(defAggregate({ skip: skip, limit: limit }), defCountTotal()).
          then(function(resp) {
            var total = resp[1];
            total = total.length > 0 ? total[0].total : 0;

            res.send({
              list: resp[0],
              total: total
            });
          }, function(err) {
            res.serverError(err);
          });

      });
    });
  },

  'filterByClient': function(req, res) {

    var limit = parseInt(req.query.limit || 10, 10);
    var skip = parseInt(req.query.skip || 0, 10);

    var $match = {
      appId: req.query.appId
    };

    if (typeof req.query.type != 'undefined') {
      $match.type = req.query.type;
    }

    mongodb.acquireConnection(sails.config.adapters.mongo, function(err, connection) {
      if (err) return res.serverError(err);

      connection.collection('exceptionoccurrence', function(err, collection) {
        if (err) return res.serverError(err);

        var aggregate = function(options, cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: { client_ua: '$client_ua', client_os: '$client_os' },
                  occurrence: { $sum: 1 },
                  createdAt: { $max: '$createdAt' }
                }
              },

              { $sort: { occurrence: -1 } },

              { $skip : options.skip },

              { $limit : options.limit },

              {
                $project: {
                  _id: 0,
                  client_ua: '$_id.client_ua',
                  client_os: '$_id.client_os',
                  latestOccurrenceAt: '$createdAt',
                  occurrence: 1
                }
              }
            ],

            {},

            cb);
        };

        var countTotal = function(cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: { client_ua: '$client_ua', client_os: '$client_os' }
                }
              },

              {
                $group: {
                  _id: 0,
                  total: { $sum: 1 }
                }
              }
            ], {}, cb);
        };

        var defAggregate = deferred.promisify(aggregate);
        var defCountTotal = deferred.promisify(countTotal);

        deferred(defAggregate({ skip: skip, limit: limit }), defCountTotal()).
          then(function(resp) {
            var total = resp[1];
            total = total.length > 0 ? total[0].total : 0;

            res.send({
              list: resp[0],
              total: total
            });
          }, function(err) {
            res.serverError(err);
          });

      });
    });
  },

  'filterByType': function(req, res) {

    var dateRange = {
      begin: new Date(+req.query.begin),
      end: new Date(+req.query.end)
    };
    var $match = {
      appId: req.query.appId,
      createdAt: {
        $gt: dateRange.begin,
        $lt: dateRange.end
      }
    };

    mongodb.acquireConnection(sails.config.adapters.mongo, function(err, connection) {
      if (err) return res.serverError(err);

      connection.collection('exceptionoccurrence', function(err, collection) {
        if (err) return res.serverError(err);

        var aggregate = function(cb) {
          collection.aggregate(
            [
              { $match: $match },

              {
                $group: {
                  _id: {
                    year : { $year : "$createdAt" },
                    month : { $month : "$createdAt" },
                    day : { $dayOfMonth : "$createdAt" },
                    type: '$type'
                  },
                  occurrence: { $sum: 1 }
                }
              },

              { $sort: { '_id.type': -1, '_id.year': 1, '_id.month': 1, '_id.day': 1 } },

              {
                $group: {
                  _id: {
                    type: '$_id.type'
                  },
                  occurrenceSeries: { $push: '$occurrence' },
                  yearSeries: { $push: '$_id.year' },
                  monthSeries: { $push: '$_id.month' },
                  daySeries: { $push: '$_id.day' }
                }
              },


              {
                $project: {
                  _id: 0,
                  type: '$_id.type',
                  occurrenceSeries: 1,
                  yearSeries: 1,
                  monthSeries: 1,
                  daySeries: 1
                }
              }
            ],

            {},

            cb);
        };


        var defAggregate = deferred.promisify(aggregate);

        defAggregate().
          then(function(resp) {
            if (resp.length > 0) {
              var index = 0;
              var i = 0;

              for (var date = moment(dateRange.begin).startOf('day'); ;i++) {
                if (!date.isSame(moment([resp[0].yearSeries[index], resp[0].monthSeries[index] - 1, resp[0].daySeries[index]]), 'day')) {
                  resp.forEach(function(item) {
                    item.occurrenceSeries.splice(i, 0, 0);
                    item.yearSeries.splice(i, 0, date.year());
                    item.monthSeries.splice(i, 0, date.month() + 1);
                    item.daySeries.splice(i, 0, date.date());
                  });
                }
                index++;
                if (date.isSame(moment(dateRange.end).startOf('day'), 'day')) break;
                date.add('d', 1);
              }
            }

            res.send(resp);
          }, function(err) {
            res.serverError(err);
          });

      });
    });
  }

};
