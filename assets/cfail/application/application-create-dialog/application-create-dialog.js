define(['angular', 'application/application_service',
        'text!./application-create-dialog.html'], function(angular, applicationCreateDialogHtml) {

  angular.module('application.create', ['application.service']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/application/application-create-dialog/application-create-dialog.html', applicationCreateDialogHtml)
    }]).
    controller('ApplicationCreateController', ['$scope', '$location', '$modalInstance', '$q', 'applicationService', function($scope, $location, $modalInstance, $q, applicationService) {

      $scope.submit = function(name) {
        applicationService.create({ name: name }).
          then(function(xhr) {
            var application = xhr.data;

            return applicationService.stage({
              appId: application.id,
              appName: application.name,
              role: 'admin'
            });
          }).
          then(function(data, status, headers, config) {
            $scope.$close();
            $location.path('/app/' + data.id + '/filter-failures');
            location.reload();
          });
      };
    }]);

});