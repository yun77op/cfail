define(['angular',
        'ap.config',
        'angular.route',
        'filter/filter-user/filter-user',
        'filter/filter-url/filter-url',
        'filter/filter-failures/filter-failures',
        'filter/filter-client/filter-client',
        'exception/exception',
        'admin/admin',
        'report/report',
        'application/application-create-dialog/application-create-dialog'], function(angular, config) {

  var deps = ['cfail',
              'ngRoute',
              'cfail.filter.user',
              'cfail.filter.failures',
              'cfail.filter.url',
              'cfail.filter.client',
              'cfail.exception',
              'cfail.admin',
              'cfail.report',
              'application.create',
              'ui.bootstrap'];
  angular.module('cfail.main', deps).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $routeProvider.
        when('/app/:appId/filter-user', {
          templateUrl: '/cfail/filter/filter-user/filter-user.html',
          controller: 'FilterUserController'
        }).
        when('/app/:appId/filter-url', {
          templateUrl: '/cfail/filter/filter-url/filter-url.html',
          controller: 'FilterUrlController'
        }).
        when('/app/:appId/filter-failures', {
          templateUrl: '/cfail/filter/filter-failures/filter-failures.html',
          controller: 'FilterFailuresController'
        }).
        when('/app/:appId/filter-client', {
          templateUrl: '/cfail/filter/filter-client/filter-client.html',
          controller: 'FilterClientController'
        }).
        when('/app/:appId/admin', {
          templateUrl: '/cfail/admin/admin.html',
          controller: 'AdminController'
        }).
        when('/app/:appId/report', {
          templateUrl: '/cfail/report/report.html',
          controller: 'ReportController'
        }).
        when('/app/failure/:exceptionId', {
          templateUrl: '/cfail/exception/exception.html',
          controller: 'ExceptionController'
        }).
        otherwise({
          redirectTo: '/'
        });

      $locationProvider.html5Mode(true);
    }]).
    controller('MainController', ['$scope', '$modal', function($scope, $modal) {
      $scope.stagedList = config.stagedList;
      $scope.currentStaged = config.stagedList[0];

      $scope.createApplication = function() {
        var modal = $modal.open({
          templateUrl: '/cfail/application/application-create-dialog/application-create-dialog.html',
          controller: 'ApplicationCreateController',
          keyboard: true
        });
      };
    }]);

});