define(['angular', 'text!./filter-user.html', '../filter_service', 'angular.bootstrap'], function(angular, filterUserHtml) {

  angular.module('cfail.filter.user', ['cfail', 'cfail.filter.service', 'ui.bootstrap']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/filter/filter-user/filter-user.html', filterUserHtml)
    }]).
    controller('FilterUserController', ['$scope', 'filterService', function($scope, filterService) {
      var renderUserListViewByPage = function(page) {
        var limit = 10;

        filterService.getList('User', { skip: (page - 1) * limit, limit: limit }).
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