define(['angular', 'angular.bootstrap', '/cfail/cfail_service.js'], function(angular) {

  angular.module('cfail.admin', ['cfail', 'ui.bootstrap', 'cfail.service']).
    controller('AdminController', ['$scope', 'cfailService', '$routeParams', function($scope, cfailService, $routeParams) {
      $scope.submit = function(e) {
        e.preventDefault();

        cfailService.signout({
          name: $scope.email,
          role: 'collaborator',
          appId: $routeParams.appId
        }).success(function() {

          });
      };
    }]);
});