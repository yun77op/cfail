define(['angular'], function(angular) {

  angular.module('cfail.exception.service', []).
    factory('exceptionService', ['$http', '$routeParams', function($http, $routeParams) {
      return {
        getException: function() {
          var config = {
            method: 'get',
            url: '/exception',
            params: { id: $routeParams.exceptionId }
          };
          return $http(config);
        },

        getExceptionOccurrencs: function(params) {
          params = angular.extend({ skip: 0, limit: 10, exceptionId: $routeParams.exceptionId }, params);
          var config = {
            method: 'get',
            url: '/exceptionOccurrence',
            params: params
          };
          return $http(config);
        }
      }
    }]);
});