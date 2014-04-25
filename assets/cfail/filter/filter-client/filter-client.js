define(['angular', 'text!./filter-client.html', '../filter_service', 'angular.bootstrap', '../../cfail_filter'], function(angular, filterClientHtml) {

  angular.module('cfail.filter.client', ['cfail', 'cfail.filter.service', 'ui.bootstrap', 'cfail.filter']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/filter/filter-client/filter-client.html', filterClientHtml)
    }]).
    controller('FilterClientController', ['$scope', 'filterService', function($scope, filterService) {
      var renderUserListViewByPage = function(page) {
        var limit = 10;

        filterService.getList('Client', { skip: (page - 1) * limit, limit: limit }).
          success(function(data) {
            $scope.occurrences = data.list;
            $scope.p.currentPage = page;
            $scope.p.total = data.total;
          });
      };

      $scope.p = {
        maxSize: 6
      };

      $scope.paginate = function(page) {
        renderUserListViewByPage(page);
      };

      renderUserListViewByPage(1);
    }]);
});