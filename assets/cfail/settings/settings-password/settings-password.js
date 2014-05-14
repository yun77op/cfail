define(['angular', 'text!./settings-password.html'], function(angular, settingsPasswordHtml) {

  angular.module('cfail.settings.directives', ['cfail.service']).
    directive('settingsPassword', ['cfailService', function(cfailService) {
      return {
        scope: {},
        replace: true,
        template: settingsPasswordHtml,
        restrict: 'E',
        link: function($scope, element, attrs) {
          $scope.submit = function(e) {
            e.preventDefault();
            var form = e.target;

            cfailService.changePassword({
              password: $scope.password,
              newPassword: $scope.newPassword
            }).then(function(xhr) {
                var data = xhr.data;
                if (data.success) {
                  form.reset();
                } else {
                  $scope.error_message = data.error.err;
                }
              });
          };
        }
      }
    }]);
});