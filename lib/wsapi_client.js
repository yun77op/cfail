const
  http = require('http'),
  https = require('https'),
  url = require('url'),
  querystring = require('querystring');

// this client library keeps timing stats to allow higher level code
// (like loadgen) to output latency numbers
var numberOfRequests = 0;
// consider latency over the last N requests
const LATENCY_DECAY = 300;
var recentLatency = 0;

function startRequest() {
  return new Date();
}

exports.recentLatency = function() { return recentLatency; };

function completeRequest(startTime) {
  numberOfRequests++;
  var num = numberOfRequests < LATENCY_DECAY ? numberOfRequests : LATENCY_DECAY;
  recentLatency = ((new Date() - startTime) + (recentLatency * (num - 1))) / num;
}


function injectHeaders(context, headers) {
  if (context.headers) {
    for (var k in context.headers) {
      headers[k] = context.headers[k];
    }
  }
}

function injectCookies(ctx, headers) {
  if (ctx.cookieJar && Object.keys(ctx.cookieJar).length) {
    headers.Cookie = "";
    for (var k in ctx.cookieJar) {
      headers.Cookie += k + "=" + ctx.cookieJar[k];
    }
  }
}

function extractCookies(ctx, res) {
  if (ctx.cookieJar === undefined) ctx.cookieJar = {};
  if (res.headers['set-cookie']) {
    res.headers['set-cookie'].forEach(function(cookie) {
      var m = /^([^;]+)(?:;.*)$/.exec(cookie);
      if (m) {
        var x = m[1].split('=');
        ctx.cookieJar[x[0]] = x[1];
      }
    });
  }
}

function withCSRF(cfg, context, cb) {
  if (context.session && context.session._csrf) cb(null, context.session._csrf);
  else {
    exports.get(cfg, '/csrfToken', undefined, context, function(err, r) {
      if (err) return cb(err);
      try {
        if (r.code !== 200)
          return cb({what: "http error", resp: r}); // report first error
        context.session = JSON.parse(r.body);
        context.sessionStartedAt = new Date().getTime();
        cb(null, context.session._csrf);
      } catch(e) {
        console.log('error getting csrf token: ', e);
        cb(e);
      }
    });
  }
}


exports.get = function(cfg, path, getArgs, context, cb) {
  // parse the server URL (cfg.url)
  var uObj;
  var meth;
  try {
    uObj = url.parse(cfg.url);
    meth = uObj.protocol === 'http:' ? http : https;
  } catch(e) {
    cb("can't parse url: " + e);
    return;
  }

//  var headers = {
//    'BrowserID-git-sha': commit
//  };
//  injectHeaders(context, headers);
//  injectCookies(context, headers);


  var headers = {
  };

  // skip the query string if getArgs is null (null is an object)
  if (typeof getArgs === 'object' && getArgs !== null)
    path += "?" + querystring.stringify(getArgs);

  var timingHandle = startRequest();
  meth.get({
    host: uObj.hostname,
    port: uObj.port,
    path: path,
    headers: headers,
    agent: false // disable node.js connection pooling
  }, function(res) {
    extractCookies(context, res);
    var body = '';
    res.on('data', function(chunk) { body += chunk; })
      .on('end', function() {
        completeRequest(timingHandle);
        cb(null, {code: res.statusCode, headers: res.headers, body: body});
        cb = null;
      });
  }).on('error', function (e) {
      cb(e);
      cb = null;
    });
};


exports.post = function(cfg, path, postArgs, context, cb) {
  withCSRF(cfg, context, function(err, csrf) {
    if (err) {
      if (err.what === "http error") {
        // let the session_context HTTP return code speak for the overall
        // POST
        return cb(null, err.resp);
      }
      return cb(err);
    }
// parse the server URL (cfg.url)
    var uObj;
    var meth;
    var body;
    try {
      uObj = url.parse(cfg.url);
      meth = uObj.protocol === 'http:' ? http : https;
    } catch(e) {
      cb("can't parse url: " + e);
      return;
    }

    var headers = {
      'Content-Type': 'application/json'
    };
    injectHeaders(context, headers);
    injectCookies(context, headers);

    postArgs = postArgs || {};

    postArgs._csrf = csrf;
    body = JSON.stringify(postArgs);
    headers['Content-Length'] = Buffer.byteLength(body);

    var timingHandle = startRequest();
    var req = meth.request({
      host: uObj.hostname,
      port: uObj.port,
      path: path,
      headers: headers,
      method: "POST",
      agent: false // disable node.js connection pooling
    }, function(res) {
      extractCookies(context, res);
      var body = '';
      res.on('data', function(chunk) { body += chunk; })
        .on('end', function() {
          completeRequest(timingHandle);
          cb(null, {code: res.statusCode, headers: res.headers, body: body});
          cb = null;
        });
    }).on('error', function (e) {
        cb(e);
        cb = null;
      });

    req.write(body);
    req.end();
  });

};