define(['angular', 'angular.bootstrap',
        '../application-create-dialog/application-create-dialog'], function(angular, bootstrap) {

  angular.module('application-nodata', ['cfail', 'ui.bootstrap', 'application.create']).
    controller('NodataController', ['$scope', '$modal', function($scope, $modal) {

      $scope.showCreateModal = function() {
        var modal = $modal.open({
          templateUrl: '/cfail/application/application-create-dialog/application-create-dialog.html',
          controller: 'ApplicationCreateController',
          keyboard: true
        });

      };
    }]);
});