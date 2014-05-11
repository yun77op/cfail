define(['angular', 'text!./exception.html', './exception_service', 'angular.bootstrap'], function(angular, exceptionHtml) {

  angular.module('cfail.exception', ['cfail', 'cfail.exception.service', 'ui.bootstrap']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/exception/exception.html', exceptionHtml)
    }]).
    controller('ExceptionController', ['$scope', 'exceptionService', function($scope, exceptionService) {

      $scope.exception = exceptionService.get();

      $scope.exceptionOccurrenceTemplateUrl = '';

      $scope.showOccurrences = function() {
        if (!$scope.exception) return;

        $scope.occurrences = exceptionService.getExceptionOccurrencs();
        $scope.exceptionOccurrenceTemplateUrl = '/cfail/exception/exception-occurrences.html';
      };


      $scope.setFixed = function() {
        $scope.exception.status = 'fixed';
        $scope.exception.$save();
      };
    }]);
});