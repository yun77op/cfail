define(['angular', 'cfail/cfail_service'], function(angular) {

  angular.module('cfail.register', ['cfail', 'cfail.service']).
    controller('RegisterController', ['$scope', 'cfailService', function($scope, cfailService) {

      $scope.submit = function(e) {
        e.preventDefault();

        cfailService.signup({ name: $scope.name, passwd: $scope.passwd }).
          success(function(data) {

            if (data.success) {
              location.href = '/login';
              return;
            }

            var error = data.error;

            switch (error.code) {
              case 11000:
                error.err = '该用户名已注册';
            }

            $scope.error = error;
          });
      };

    }]);
});
