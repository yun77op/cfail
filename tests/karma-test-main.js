var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
//    allTestFiles.push(pathToModule(file));
    allTestFiles.push(file);
  }
});

require.config({
  paths: {
    'angular': './components/angular/angular',
    'angular.route': './components/angular-route/angular-route',
    'angular.bootstrap': './components/angular-bootstrap/ui-bootstrap-tpls',
    'text': './components/requirejs-text/text',
    'jquery': './components/jquery/jquery',
    'highcharts': './components/highcharts/highcharts.src',
    'angular.hightcharts': './components/highcharts-ng/dist/highcharts-ng',
    'angular.mocks': './components/angular-mocks/angular-mocks'
  },

  shim: {
    'angular': {'exports': 'angular'},
    'angular.route': ['angular'],
    'angular.bootstrap': ['angular'],
    'highcharts': ['jquery'],
    'angular.hightcharts': ['highcharts']
  },

  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/assets',

  // dynamically load all test files
//  deps: allTestFiles,
  deps: ['./cfail/cfail'],

  // we have to kickoff jasmine, as it is asynchronous
  callback: function() {
    require(['angular'], function(angular) {
      window.angular = angular;

      require(['angular.mocks'], function() {
        require(allTestFiles, function() {
          window.__karma__.start();
        });
      });
    });

  }
});
