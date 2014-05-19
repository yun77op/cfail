define(['angular',
        'ap.config',
        'angular.route',
        'cfail/filter/filter-user/filter-user',
        'cfail/filter/filter-url/filter-url',
        'cfail/filter/filter-failures/filter-failures',
        'cfail/filter/filter-client/filter-client',
        'cfail/exception/exception',
        'cfail/admin/admin',
        'cfail/report/report',
        'cfail/settings/settings',
        'cfail/application/application-create-dialog/application-create-dialog'], function(angular, config) {

  var deps = ['cfail',
              'ngRoute',
              'cfail.filter.user',
              'cfail.filter.failures',
              'cfail.filter.url',
              'cfail.filter.client',
              'cfail.exception',
              'cfail.admin',
              'cfail.report',
              'cfail.settings',
              'application.create',
              'ui.bootstrap'];
  angular.module('cfail.main', deps).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $routeProvider.
        when(config.requireBase + 'app/:appId/filter-user', {
          templateUrl: config.requireBase + 'cfail/filter/filter-user/filter-user.html',
          controller: 'FilterUserController'
        }).
        when(config.requireBase + 'app/:appId/filter-url', {
          templateUrl: config.requireBase + 'cfail/filter/filter-url/filter-url.html',
          controller: 'FilterUrlController'
        }).
        when(config.requireBase + 'app/:appId/filter-failures', {
          templateUrl: config.requireBase + 'cfail/filter/filter-failures/filter-failures.html',
          controller: 'FilterFailuresController'
        }).
        when(config.requireBase + 'app/:appId/filter-client', {
          templateUrl: config.requireBase + 'cfail/filter/filter-client/filter-client.html',
          controller: 'FilterClientController'
        }).
        when(config.requireBase + 'app/:appId/admin/:subsection?', {
          templateUrl: config.requireBase + 'cfail/admin/admin.html',
          controller: 'AdminController'
        }).
        when('/app/:appId/report', {
          templateUrl: config.requireBase + 'cfail/report/report.html',
          controller: 'ReportController'
        }).
        when('/app/failure/:exceptionId', {
          templateUrl: config.requireBase + 'cfail/exception/exception.html',
          controller: 'ExceptionController'
        }).
        when('/settings', {
          templateUrl: config.requireBase + 'cfail/settings/settings.html',
          controller: 'SettingsController'
        }).
        otherwise({
          redirectTo: '/app/' + config.stagedList[0].id + '/filter-failures'
        });

      $locationProvider.html5Mode(true);
    }]).
    controller('MainController', ['$scope', '$modal', '$rootScope', '$routeParams', '$location',
      function($scope, $modal, $rootScope, $routeParams, $location) {
        $scope.stagedList = config.stagedList;
        $scope.currentStaged = config.stagedList[0];

        $scope.createApplication = function() {
          var modal = $modal.open({
            templateUrl: config.requireBase + 'cfail/application/application-create-dialog/application-create-dialog.html',
            controller: 'ApplicationCreateController',
            keyboard: true
          });
        };

        $rootScope.$on('$routeChangeSuccess', function(e) {
          if (!$routeParams.appId) return;

          var activeNavItem = $location.path().split('/').pop();
          $scope.activeNavItem = activeNavItem;
        });
      }]);

});