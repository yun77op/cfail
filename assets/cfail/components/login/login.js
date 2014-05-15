define(['angular', '/cfail/cfail_service.js'], function(angular) {

  angular.module('cfail.login', ['cfail', 'cfail.service']).
    controller('LoginController', ['$scope', 'cfailService', function($scope, cfailService) {

      $scope.submit = function(e) {
        e.preventDefault();

        cfailService.login({ name: $scope.name, passwd: $scope.passwd }).
          success(function(data) {

            if (data.success) {
              location.href = '/';
              return;
            }

            $scope.error_message = data.error_message;
          });
      };

    }]);
});