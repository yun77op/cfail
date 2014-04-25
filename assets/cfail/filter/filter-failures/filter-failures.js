define(['angular', 'text!./filter-failures.html', '../filter_service', 'angular.bootstrap', 'angular.hightcharts'], function(angular, filterFailuresHtml) {

  angular.module('cfail.filter.failures', ['cfail', 'cfail.filter.service', 'ui.bootstrap', 'highcharts-ng']).
    run(['$templateCache', function($templateCache) {
      $templateCache.put('/cfail/filter/filter-failures/filter-failures.html', filterFailuresHtml)
    }]).
    controller('FilterFailuresController', ['$scope', 'filterService', function($scope, filterService) {
      var renderUserListViewByPage = function(page) {
        var limit = 10;

        filterService.getList('Failure', { skip: (page - 1) * limit, limit: limit }).
          success(function(data) {
            $scope.exceptions = data.list;
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


      $scope.chartConfig = {
        chart: {
          type: 'line',
          backgroundColor: '#f8f9fb'
        },
        tooltip: {
          shared: true
        },
        title: {
          text: ''
        },
        plotOptions: {
          series: {
            fillOpacity: 0.1
          }
        },
        xAxis: {
          categories: []
        },
        yAxis: {
          title: {
            text: '错误次数'
          },
          plotLine: [{
            width: 1
          }]
        },
        series: []
      };

      var time = new Date();
      time.setDate(time.getDate() - 6);
      filterService.getFailuresRange({ begin: time.valueOf() }).
        success(function(list) {
          if (list.length > 0) {
            list[0].daySeries.forEach(function(day, i) {
              $scope.chartConfig.xAxis.categories.push(list[0].monthSeries[i] + '/' + day);
            });
          }

          list.forEach(function(obj) {
            $scope.chartConfig.series.push({
              name: obj.type,
              type: 'areaspline',
              data: obj.occurrenceSeries
            });
          });

        });
    }]);
});