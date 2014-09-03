define(['angular','_', 'ap.config', 'angular.bootstrap', 'cfail/cfail_service',
        './admin-collaborator/admin-collaborator',
        './admin-integration/admin-integration'], function(angular, _, config) {

  angular.module('cfail.admin', ['cfail', 'ui.bootstrap', 'cfail.service', 'cfail.admin.collaborator', 'cfail.admin.integration']).
    controller('AdminController', ['$scope', 'cfailService', '$routeParams', '$compile', function($scope, cfailService, $routeParams, $compile) {
      var subsection = $routeParams.subsection || 'collaborator';

      $scope.appId = $routeParams.appId;
      $scope.subsection = subsection;
    }]).
    directive('subsection', ['cfailService', '$routeParams', '$compile', function(cfailService, $routeParams, $compile) {
      return {
        scope: {},
        replace: true,
        template: '<div></div>',
        restrict: 'EA',
        link: function($scope, element, attrs) {
          var directive = 'admin-' + attrs.subsection;
          var html = '<' + directive + '><' + directive + '/>';

          var el = $compile(html)($scope);
          element.append(el);
        }
      }
    }]);
});
