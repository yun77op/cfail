define(['angular'], function(angular) {

  angular.module('cfail.filter.service', []).
    factory('filterService', ['$http', '$routeParams', function($http, $routeParams) {
      return {
        getList: function(type, params) {
          params = angular.extend({ skip: 0, limit: 10, appId: $routeParams.appId }, params);
          var config = {
            method: 'get',
            url: '/exceptionOccurrence/filterBy' + type,
            params: params
          };
          return $http(config);
        },

        getFailuresRange: function(params) {
          params = angular.extend({ end: Date.now(), appId: $routeParams.appId }, params);
          var config = {
            method: 'get',
            url: '/exceptionOccurrence/filterByType',
            params: params
          };
          return $http(config);
        }
      }
    }]);
});