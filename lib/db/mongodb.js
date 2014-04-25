var
  Server = require('mongodb').Server,
  Db = require('mongodb').Db,
  ReplSet = require('mongodb').ReplSet,
  _ = require('lodash');

var connection;

exports.acquireConnection = function(config, cb) {
  if (connection) {
    return cb(null, connection);
  }

  var defaults = {
    nativeParser: true,
    safe: true
  };
  config = _.defaults(_.pick(config, 'user', 'password', 'host', 'port', 'database'), defaults);

  createConnection(config, function(err, aConnection) {
    if (err) console.error('DB error: ' + err);
    connection = aConnection;
    cb(err, connection);
  });
};

function createConnection(config, cb) {
  var safe = config.safe ? 1 : 0,
    serverOptions = {native_parser: config.nativeParser, auth: { user: config.user, password: config.password }},
    server;

  if (config.replSet && Array.isArray(config.replSet.servers) && config.replSet.servers.length) {
    var replSet = [];

    replSet.push(new Server( config.host, config.port));

    config.replSet.servers.forEach(function(server) {
      replSet.push(new Server( server.host, server.port || config.port));
    });

    _.extend(serverOptions, config.replSet.options || {});

    server = new ReplSet(replSet, serverOptions);
  }
  else {
    server = new Server(config.host, config.port, serverOptions);
  }

  var db = new Db(config.database, server, {w: safe, native_parser: config.nativeParser});

  db.open(function(err) {
    if (err) return cb(err);

    if (serverOptions.auth.user && serverOptions.auth.password) {
      return db.authenticate(serverOptions.auth.user, serverOptions.auth.password, function(err, success) {
        if (success) return cb(null, db);
        if (db) db.close();
        return cb(err ? err : new Error('Could not authenticate user ' + serverOptions.auth.user), null);
      });
    }

    return cb(null, db);
  });
}
