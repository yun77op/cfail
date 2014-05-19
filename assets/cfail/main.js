require(['ap.config'], function(cfg) {
  require.config({
    baseUrl: cfg.requireBase,

    paths: {
      'angular': 'http://cdn.staticfile.org/angular.js/1.2.6/angular.min',
      'angular.route': '/components/angular-route/angular-route',
      'angular.bootstrap': '/components/angular-bootstrap/ui-bootstrap-tpls',
      'text': 'components/requirejs-text/text',
      'jquery': 'http://cdn.staticfile.org/jquery/1.9.1/jquery.min',
      'highcharts': 'http://cdn.staticfile.org/highcharts/3.0.7/highcharts',
      'angular.hightcharts': '/components/highcharts-ng/dist/highcharts-ng',
      '_': 'http://cdn.staticfile.org/lodash.js/2.4.1/lodash.min',
      'angular.resources': 'http://cdn.staticfile.org/angular-resource/1.2.16/angular-resource.min'
    },

    shim: {
      'angular': {'exports': 'angular'},
      'angular.route': ['angular'],
      'angular.resources': ['angular'],
      'angular.bootstrap': ['angular'],
      'highcharts': ['jquery'],
      'angular.hightcharts': ['highcharts'],
      '_': {'exports': '_'}
    }
  });



  require(['angular', 'cfail/cfail_service'], function(angular) {
    angular.module('cfail', ['cfail.service']).
      config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.transformRequest.unshift(function(data, headers) {
          if (angular.isObject(data) && Object.prototype.toString.call(data) !== '[object File]') {
            data._csrf = cfg.csrfToken;
          }

          return data;
        });
      }]).
      controller('MainController', ['$scope', 'cfailService', function($scope, cfailService) {
        $scope.signout = function() {
          cfailService.signout();
        };

      }]);


    ah.flushHoldingQueue('addComponentMetadata', function(metadata) {
      require(metadata.deps || [], function() {
        angular.module(metadata.moduleName).value('componentMetadata', metadata.cfg);
        angular.bootstrap(document.getElementById(metadata.elementId), [metadata.moduleName]);
      });
    });

  });
});

