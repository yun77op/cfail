define(['angular', 'text!./admin-integration.html', 'ap.config'], function(angular, html, config) {

  angular.module('cfail.admin.integration', ['cfail.service']).
    directive('adminIntegration', ['cfailService', '$routeParams', function(cfailService, $routeParams) {
      return {
        scope: {},
        replace: true,
        template: html,
        restrict: 'E',
        link: function($scope, element, attrs) {
          $scope.baseUrl = config.baseUrl;
          $scope.appId = $routeParams.appId;
        }
      }
    }]);
});