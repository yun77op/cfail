
const
  deferred = require('deferred'),
  wsapiClient = require('../lib/wsapi_client'),
  serverUrl = 'http://localhost:1337';

var generateRandomExceptionOccurrences = function(number) {
  var result = [];
  var o = {
    name: ['ReferenceError: sdf is not defined', 'Error: unknown', 'Error: bad', 'RunError: unknown', 'Error: bad'],
    stack: ['nodataComponent is not defined\n\
            at eval (eval at <anonymous> (/usr/local/lib/node_modules/sails/node_modules/ejs/lib/ejs.js:236:14), <anonymous>:29:532)\n\
            at eval (eval at <anonymous> (/usr/local/lib/node_modules/sails/node_modules/ejs/lib/ejs.js:236:14), <anonymous>:29:622)'],
    type: ['javascript', 'nodejs', 'java', 'python', 'lisp'],
    username: ['anonymous', 'yun77op', 'testlink', 'zhte', 'xman'],
    appId: ['53523f4fe15cb164149d2ef4'],
    path: ['/', '/forbidden', '/user/name', 'wrong/place', 'kidding'],
    agent: ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:28.0) Gecko/20100101 Firefox/28.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/537.75.14',
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.62 Safari/537.36',
            'Mozilla/5.0 (Windows NT 5.0; rv:21.0) Gecko/20100101 Firefox/21.0',
            'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
            'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.14) Gecko/20080608 Firefox/2.0.0.14 Flock/1.2.2']
  };
  var keys = Object.keys(o);
  var exceptionOccurrence;

  while (number--) {
    exceptionOccurrence = {};
    keys.forEach(function(key) {
      var alternatives = o[key];
      var i = Math.min(Math.ceil(Math.random() * alternatives.length), alternatives.length - 1);
      exceptionOccurrence[key] = alternatives[i];
    });
    result.push(exceptionOccurrence);
  }

  return result;
};

var want = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 1;

console.log('creating ' + want + ' test exceptionOccurrence' + (want > 1 ? 's' : ''));

var exceptionOccurrences = generateRandomExceptionOccurrences(want);

var createExceptionOccurrence = function(exceptionOccurrence, cb) {
  var def = deferred();
  var ctx = {};

  wsapiClient.post({
    url: serverUrl
  }, '/exceptionOccurrence/create', exceptionOccurrence, ctx, function(err, resp) {
    if (err) return def.reject(err);
    try {
      var body = JSON.parse(resp.body);
      if (body.success !== true) {
        def.reject(new Error("request failed: " + resp.body));
      } else {
        def.resolve();
      }
    } catch(e) {
      return def.reject(e);
    }
  });

  return def.promise;
};

var createExceptionOccurrenceThrottled = deferred.gate(createExceptionOccurrence, 2);
deferred.map(exceptionOccurrences, createExceptionOccurrenceThrottled)(function(result) {
  process.exit(0);
}).
done(null, doError);

function doError(e) {
  process.stderr.write("error: " + e.toString() + "\n");
  process.exit(1);
}
