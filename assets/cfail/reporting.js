window.cfail = window.cfail || {};
cfail.reporting = (function () {
  var random = function () {
    function K() {
      return(((1 + Math.random()) * 65536) | 0).toString(16).substring(1)
    }

    return(K() + K() + "-" + K() + "-" + K() + "-" + K() + "-" + K() + K() + K())
  };
  var defaults = {id: null, processInterval: 4, daysToStore: 7, onBeforeStore: null, appfailApiRoot: "http://cfail.herokuapp.com"};
  var requestData = {RequestUrl: "", HttpVerb: "", ReferrerUrl: document.referrer, OccurrenceTimeUtc: null, User: "Anonymous", PostValuePairs: [], QueryValuePairs: [], Cookies: [], UniqueId: null, UserAgent: navigator.userAgent, HttpStatus: null, Exceptions: [], PageCorrelationId: random(), IsXHRFailure: false, XHRRequestURL: null, ConnectionStatus: "online", IsStandalone: false, TimeOnPage: 0};
  var defaultException = {ExceptionType: "Javascript Error", ExceptionMessage: "", StackTrace: ""};
  var config = {};
  var exceptionQueue = [];
  var m;
  var hasOfflineEvents = ("ononline" in window && "onoffline" in window) ? true : false;

  function hasJSON() {
    return"JSON" in window && window.JSON
  }

  var hasLocalStorage = ("localStorage" in window && window.localStorage) ? true : false;
  var y = new Date();
  var J = false;
  var RequestUrl = null;
  var logEnabled = false;
  var D = "cfail/reporting.js";
  var JOSN2_URL = "http://cdn.staticfile.org/json2/20130526/json2.min.js";
  var hasOnlineBool = J ? false : (typeof navigator.onLine === "boolean") ? true : false;
  var clone = function (L) {
    var M = !L ? null : (L instanceof Array ? [] : {});
    for (var K in L) {
      if (typeof(L[K]) === "object") {
        M[K] = clone(L[K])
      } else {
        M[K] = L[K]
      }
    }
    return M
  };
  var extend = function (O, N) {
    var L = {};
    for (var prop in O) {
      if (O.hasOwnProperty(prop)) {
        L[prop] = O[prop]
      }
    }
    for (var K in N) {
      if (N.hasOwnProperty(K)) {
        L[K] = N[K]
      }
    }
    return L
  };
  var log = function (message) {
    if (logEnabled && typeof console === "object") {
      console.log(message)
    }
  };
  var addEventListener = function (element, eventName, eventListener) {
    if (element.addEventListener) {
      element.addEventListener(eventName.replace(/^on/, ""), eventListener, false)
    } else {
      if (element[eventName]) {
        var K = element[eventName];
        element[eventName] = function (O) {
          K.apply(null, arguments);
          eventListener.apply(null, arguments);
        }
      } else {
        element[eventName] = function (O) {
          eventListener.apply(null, arguments);
        }
      }
    }
  };
  (function (L) {
    var M = L.prototype.send;
    L.prototype.send = function (Q) {
      var O = this;
      var P;
      var N = function () {
        if (O.readyState === 4) {
          log(O);
          var R = O.appfailData;
          if (O.status && O.status >= 400) {
            catchXhrError({ReadyState: O.readyState, Status: O.status, StatusText: O.statusText, Method: R ? R.method : null, Url: R ? R.url : null})
          }
        }
        if (P) {
          P()
        }
      };
      if (this.addEventListener) {
        this.addEventListener("readystatechange", N, false)
      } else {
        P = this.onreadystatechange;
        this.onreadystatechange = N
      }
      M.call(this, Q)
    };
    var K = L.prototype.open;
    L.prototype.open = function (P, N, O) {
      this.appfailData = {method: P, url: N};
      K.call(this, P, N, O)
    }
  })(XMLHttpRequest);

  var bootstrap = function () {
    addEventListener(window, "onerror", function (M, L, K) {
      catchError(M, L, K);
      return true
    });
    m = window.setInterval(function () {
      if (exceptionQueue.length) {
        processQueue()
      }
    }, config.processInterval * 1000);
    if (hasOfflineEvents) {
      addEventListener(window, "ononline", function () {
        loadStoredErrors();
        processQueue()
      })
    }
  };

  var b = function () {
    return(new Date() - y)
  };
  var query = [];
  (function () {
    var K, M = /\+/g, L = /([^&=]+)=?([^&]*)/g, O = function (P) {
      return decodeURIComponent(P.replace(M, " "))
    }, N = window.location.search.substring(1);
    K = L.exec(N);
    while (K) {
      query.push([O(K[1]), O(K[2])]);
      K = L.exec(N)
    }
  })();
  var populateFailOccurrence = function (error) {
    error.RequestUrl = RequestUrl ? RequestUrl : document.location.href;
    if (!error.OccurrenceTimeUtc) {
      error.OccurrenceTimeUtc = new Date().getTime()
    }
    error.UniqueId = random();
    error.TimeOnPage = b();
    error.UserAgent = navigator.userAgent;
    error.Cookies = [];
    error.ReferrerUrl = document.referrer;
    error.QueryValuePairs = query;
  };
  var catchError = function (message, url, linenumber) {
    log(message, url, linenumber);

    if (typeof message === 'string') {
        message = {message: message};
        message.filename = url;
        message.lineno = linenumber;
    }

    var failOccurrence = clone(requestData);
    failOccurrence.OccurrenceTimeUtc = (message && message.timeStamp) ? new Date(message.timeStamp).getTime() : null;
    var exception = clone(defaultException);
    exception.ExceptionMessage = message.message;
    exception.StackTrace = message.filename + " --- line " + message.lineno;
    failOccurrence.Exceptions.push(exception);
    populateFailOccurrence(failOccurrence);
    if (config.onBeforeStore) {
      config.onBeforeStore(failOccurrence)
    }
    exceptionQueue.push(failOccurrence)
  };
  var catchXhrError = function (xhr) {
    log(xhr);
    if (!xhr.Url) {
      return
    }
    var failOccurrence = clone(requestData);
    failOccurrence.XHRRequestURL = xhr.Url;
    failOccurrence.IsXHRFailure = true;
    failOccurrence.HttpStatus = xhr.Status;
    failOccurrence.HttpVerb = xhr.Method;
    populateFailOccurrence(failOccurrence);
    if (config.onBeforeStore) {
      config.onBeforeStore(failOccurrence)
    }
    exceptionQueue.push(failOccurrence)
  };
  var catchManual = function (err) {
    log(err);
    var failOccurrence = clone(requestData);
    var exception = clone(defaultException);
    exception.StackTrace = err.stack || "";
    if (err.type) {
      exception.ExceptionType = err.type
    }
    exception.ExceptionMessage = err.message;
    failOccurrence.Exceptions.push(exception);
    populateFailOccurrence(failOccurrence);
    if (config.onBeforeStore) {
      config.onBeforeStore(failOccurrence)
    }
    exceptionQueue.push(failOccurrence)
  };
  var processQueue = function () {
    if (exceptionQueue.length && ((hasOnlineBool && !navigator.onLine) || !hasJSON())) {
      if (!hasJSON()) {
        error("JSON parser has not yet loaded. Stored failure reports to local storage.")
      } else {
        error("No connection found, stored failure reports to local storage")
      }
      storeQueue();
      exceptionQueue = [];
      return
    }
    var M = {ID: config.id, ModuleVersion: "1.0.0.0", ApplicationType: "Javascript", FailOccurrences: []};
    while (exceptionQueue.length) {
      var L = exceptionQueue.shift();
      M.FailOccurrences.push(L)
    }
    exceptionQueue.length = 0;

    var img = new Image();
    img.src = config.appfailApiRoot + "/jsFail/v1?json=" + encodeURIComponent(JSON.stringify(M))
  };
  var storeQueue = function () {
    if (hasJSON() && hasLocalStorage) {
      var N = window.localStorage.getItem("cfail-errors");
      if (N !== "" && N !== null) {
        var L = JSON.parse(N);
        for (var M = 0, K = L.length; M < K; M++) {
          exceptionQueue.push(L[M])
        }
      }
      window.localStorage.setItem("cfail-errors", JSON.stringify(exceptionQueue))
    }
  };
  var loadStoredErrors = function () {
    if (!hasLocalStorage) {
      return
    }
    var exceptions;
    var Q = window.localStorage.getItem("cfail-errors");
    if (Q === "" || Q === null) {
      return
    }
    exceptions = JSON.parse(Q);
    var now = +new Date();
    var L = 86400000;
    var R = config.daysToStore * L;
    var M = [];
    for (var O = 0, K = exceptions.length; O < K; O++) {
      if (now - R > exceptions[O].OccurrenceTimeUtc) {
        error("Dropping an old error")
      } else {
        M.push(exceptions[O])
      }
    }
    exceptionQueue = M;
    window.localStorage.removeItem("cfail-errors")
  };
  var mergeConfigFromScript = function () {
    if (cfail.config) {
      config = extend(defaults, cfail.config);
      return
    }
    var scripts = document.getElementsByTagName("script");
    var cfailScript;
    for (var i = 0, l = scripts.length; i < l; i++) {
      if (scripts[i].src.indexOf(D) > -1) {
        cfailScript = scripts[i];
        break
      }
    }
    if (cfailScript.src.indexOf("?") === -1) {
      return
    }
    var L = cfailScript.src.split("?")[1];
    var M = L.split("&");
    var N = {};
    for (var P = 0, T = M.length; P < T; P++) {
      var Q = M[P].split("=");
      N[Q[0]] = Q[1]
    }
    config = extend(defaults, N)
  };

  function hasConfigFromQuery(str) {
    var result = new RegExp("[?&]" + str + "=([^&]*)").exec(window.location.search);
    return result && decodeURIComponent(result[1].replace(/\+/g, " "))
  }

  function loadJSON() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = JOSN2_URL;
    document.body.appendChild(script)
  }

  (function () {
    if (!hasJSON()) {
      loadJSON()
    }
    mergeConfigFromScript();
    if (!config.id) {
      error("No application id was found.");
      return
    }
    if (hasOnlineBool && navigator.onLine) {
      loadStoredErrors()
    }

    bootstrap();

    if (hasConfigFromQuery("cfail-report-test-exception")) {
      try {
        throw new Error("This is an Appfail test exception. Congratulations, your web-site is successfully reporting javascript errors to Appfail")
      } catch (err) {
        catchManual(err)
      }
    }
  })();
  var error = function (message) {
    if (console && console.error) {
      console.error("cfail: " + message)
    }
  };
  var runTests = function () {
    log("hasOnlineBool: ", hasOnlineBool);
    log("hasOfflineEvents: ", hasOfflineEvents);
    log("hasJSON: ", hasJSON());
    log("hasLocalStorage: ", hasLocalStorage)
  };
  return{catchManual: catchManual, processQueue: processQueue, storeQueue: storeQueue, loadStoredErrors: loadStoredErrors, runTests: runTests}
})();
