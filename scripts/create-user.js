var wsapiClient = require('../lib/wsapi_client');

var argv = require('optimist')
  .usage('Create a test user.\nUsage: $0')
  .alias('h', 'help')
  .describe('h', 'display this usage message')
  .alias('s', 'server')
  .describe('s', 'server url')
  .default('s', 'http://localhost:1337')
  .alias('u', 'username')
  .describe('u', 'username')
  .alias('p', 'passwd')
  .describe('p', 'passwd')
  .demand(['u', 'p']);


var ctx = {};
var args = argv.argv;

if (args.h) {
  argv.showHelp();
  process.exit(0);
}

wsapiClient.post({
  url: args.s
}, '/signup', {
  name: args.u,
  passwd: args.p
}, ctx, function(err, response) {
  function doError(e) {
    process.stderr.write("error: " + e.toString() + "\n");
    process.stderr.write("response: " + response.body  + "\n");
    process.exit(1);
  }
  if (err) return doError(err);
  try {
    var body = JSON.parse(response.body);
    if (body.success !== true) {
      throw "request failed: " + response.body;
    }
  } catch(e) {
    return doError(e);
  }
});