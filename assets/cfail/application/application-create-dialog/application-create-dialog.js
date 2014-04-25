define(['angular', '../application_service',
        'text!./application-create-dialog.html'], function(angular, applicationCreateDialogHtml) {

  angular.module('application.create', ['application.service']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/application/application-create-dialog/application-create-dialog.html', applicationCreateDialogHtml)
    }]).
    controller('ApplicationCreateController', ['$scope', '$location', '$modalInstance', 'applicationService', function($scope, $location, $modalInstance, applicationService) {

      $scope.submit = function(name) {
        applicationService.create({ name: name }).
          success(function(data, status, headers, config) {
            $scope.$close();
            $location.path('/app/' + data.id + '/filter-failures');
            location.reload();
          });
      };
    }]);

});