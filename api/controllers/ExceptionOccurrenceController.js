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
var email = require('../../lib/mail');

module.exports = {
    


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to ExceptionOccurrenceController)
   */
  _config: {},

  'jsFail': function(req, res) {
    var data;

    var respond = function() {
      var img = new Buffer('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
      res.contentType = 'image/gif';
      res.send(img);
    };

    try {
      data = JSON.parse(req.query.json);
    } catch(e) {
      respond();
      return;
    }

    module.exports._create(data, respond);
  },

  _create: function(json, cb) {
    var exceptions = [];
    var exceptionOccurrences = [];

    json.FailOccurrences.forEach(function(failOccurrence) {
      failOccurrence.Exceptions.forEach(function(aException) {
        var exception = {
          type: json.ApplicationType,
          stack: aException.StackTrace || '',
          name: aException.ExceptionMessage,
          appId: json.ID,
          username: failOccurrence.User
        };

        exceptions.push(exception);

        var exceptionOccurrence = {
          type: json.ApplicationType,
          name: aException.ExceptionMessage,
          appId: json.ID,
          username: failOccurrence.User,
          exceptionId: null,
          path: failOccurrence.XHRRequestURL || failOccurrence.RequestUrl
        };

        var client = uaParser.parse(failOccurrence.UserAgent);
        exceptionOccurrence.client_ua = client.ua.toString();
        exceptionOccurrence.client_os = client.os.toString();

        exceptionOccurrences.push(exceptionOccurrence);
      });
    });

    var insertException = function(exception, i) {
      return Exception.findOneByName(exception.name).
        then(function(aException) {
          if (!aException) {
            return Exception.create(exception);
          }
          return aException;
        }).
        catch(function(err) {
          // Ignore E11000 duplicate key error
          if (err.code == '11000') {
            return Exception.findOneByName(exception.name);
          }
        }).
        then(function(exception) {
          var exceptionOccurrence = exceptionOccurrences[i];
          exceptionOccurrence.exceptionId = exception.id;
          return ExceptionOccurrence.create(exceptionOccurrence);
        });
    };

    if (json.ID !== 'demo') {
      Application.findOne(json.ID).
        done(function(err, app) {
          if (err || !app || app.reportFailureEmail) return;

          email.sendNotificationEmail(app.reportFailureEmail, null, {
            appId: json.ID
          });
        });
    }


    deferred.map(exceptions, insertException)(function() {
      cb();
    }).
    catch(function(err) {
      sails.log.error(err);
      cb(err);
    });
  },

  'create': function(req, res) {
    // TODO: First , let's verify the payload's integrity?

    var body = req.body;

    module.exports._create(body, function(err) {
      if (err) {
        res.send({
          success: false,
          error: err.toString()
        });
      } else {
        res.send({
          success: true
        });
      }
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

    sails.adapters['sails-mongo'].native('exceptionoccurrence', function(err, collection) {
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

    sails.adapters['sails-mongo'].native('exceptionoccurrence', function(err, collection) {
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

    sails.adapters['sails-mongo'].native('exceptionoccurrence', function(err, collection) {
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

    sails.adapters['sails-mongo'].native('exceptionoccurrence', function(err, collection) {
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

    sails.adapters['sails-mongo'].native('exceptionoccurrence', function(err, collection) {
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
  }

};
