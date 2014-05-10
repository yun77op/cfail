define(['angular', '_', 'angular.bootstrap', 'application/application_service'], function(angular, _) {


  angular.module('cfail.report', ['cfail', 'ui.bootstrap', 'cfail.service']).
    controller('ReportController', ['$scope', '$routeParams', 'applicationService', '$q',
      function($scope, $routeParams, applicationService, $q) {
        var appId = $routeParams.appId;

        $q.all([applicationService.getApplication(appId),
                applicationService.getAllEmails(appId)]).
          then(function(responses) {
            $scope.stagedList = responses[1].data.stagedList;

            var app = responses[0].data;
            $scope.reportFailureEmail = _.find($scope.stagedList, function(staged) {
              return app.reportFailureEmail === staged.userName;
            });
          });

        $scope.changeReportFailureEmail = function(staged) {
          applicationService.updateApplicationProps(appId, {
            reportFailureEmail: staged && staged.userName || ''
          });
        };
      }]);
});