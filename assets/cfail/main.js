require.config({
  baseUrl: '/cfail',

  paths: {
    'angular': '../../components/angular/angular',
    'angular.route': '../../components/angular-route/angular-route',
    'angular.bootstrap': '../../components/angular-bootstrap/ui-bootstrap-tpls',
    'text': '../../components/requirejs-text/text',
    'jquery': '../../components/jquery/jquery',
    'highcharts': '../../components/highcharts/highcharts.src',
    'angular.hightcharts': '../../components/highcharts-ng/dist/highcharts-ng',
    '_': '/components/lodash/dist/lodash',
    'angular.resources': '/components/angular-resource/angular-resource'
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

require(['angular', 'ap.config', '/cfail/cfail_service.js'], function(angular, cfg) {

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