define(['angular', 'text!./admin-collaborator.html', 'ap.config'], function(angular, html, config) {

  angular.module('cfail.admin.collaborator', ['cfail.service']).
    directive('adminCollaborator', ['cfailService', '$routeParams', function(cfailService, $routeParams) {
      return {
        scope: {},
        replace: true,
        template: html,
        restrict: 'E',
        link: function($scope, element, attrs) {

          $scope.collaborators = [];

          $scope.submit = function(e) {
            e.preventDefault();

            var appId = $routeParams.appId;

            if (appId === 'demo') {
              return alert('demo 应用不支持添加协作者');
            }

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
        }
      }
    }]);
});