define(['angular','_', 'ap.config', 'angular.bootstrap', '/cfail/cfail_service.js'], function(angular, _, config) {

  angular.module('cfail.admin', ['cfail', 'ui.bootstrap', 'cfail.service']).
    controller('AdminController', ['$scope', 'cfailService', '$routeParams', function($scope, cfailService, $routeParams) {

      $scope.collaborators = [];

      $scope.submit = function(e) {
        e.preventDefault();

        var appId = $routeParams.appId;
        var staged = _.find(config.stagedList, function(staged) {
          return staged.appId === appId;
        });

        cfailService.addCollaborator({
          name: $scope.email,
          appId: appId,
          appName: staged.appName
        }).success(function(data) {
            $scope.email = '';
            $scope.collaborators.push(data.staged);
          });
      };

      $scope.removeCollaborator = function(collaboratorId) {
        cfailService.destroyStage(collaboratorId).
          success(function(data) {
            $scope.collaborators = _.reject($scope.collaborators, function(collaborator) { return collaborator.id === collaboratorId });
          });
      };


      cfailService.getCollaboratorsByAppId($routeParams.appId).
        success(function(data) {
          $scope.collaborators = $scope.collaborators.concat(data.stagedList);
        });
    }]);
});