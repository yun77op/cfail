define(['angular', 'text!./filter-url.html', '../filter_service', 'angular.bootstrap'], function(angular, filterUrlHtml) {

  angular.module('cfail.filter.url', ['cfail', 'cfail.filter.service', 'ui.bootstrap']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/filter/filter-url/filter-url.html', filterUrlHtml)
    }]).
    controller('FilterUrlController', ['$scope', 'filterService', function($scope, filterService) {
      var renderUserListViewByPage = function(page) {
        var limit = 10;

        filterService.getList('Url', { skip: (page - 1) * limit, limit: limit }).
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