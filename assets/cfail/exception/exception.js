define(['angular', 'text!./exception.html', './exception_service', 'angular.bootstrap'], function(angular, exceptionHtml) {

  angular.module('cfail.exception', ['cfail', 'cfail.exception.service', 'ui.bootstrap']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/exception/exception.html', exceptionHtml)
    }]).
    controller('ExceptionController', ['$scope', 'exceptionService', function($scope, exceptionService) {

      exceptionService.getException().
        success(function(data) {
          $scope.exception = data;
        });

      $scope.exceptionOccurrenceTemplateUrl = '';

      $scope.showOccurrences = function() {
        if (!$scope.exception) return;

        exceptionService.getExceptionOccurrencs().
          success(function(data) {
            $scope.occurrences = data;
          });

        $scope.exceptionOccurrenceTemplateUrl = '/cfail/exception/exception-occurrences.html';
      };
    }]);
});