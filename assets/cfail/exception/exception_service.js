define(['angular', 'angular.resources'], function(angular) {

  angular.module('cfail.exception.service', ['ngResource']).
    factory('exceptionService', ['$http', '$routeParams', '$resource', function($http, $routeParams, $resource) {
      return $resource('/exception', { id: $routeParams.exceptionId }, {
        get: {method:'get', isArray:false},
        getExceptionOccurrencs: {
          method: 'get',
          isArray: true,
          url: '/exceptionOccurrence',
          params: { skip: 0, limit: 10, exceptionId: $routeParams.exceptionId, id: null }
        },
        save: {method: 'put', isArray: false, data: {}}
      });
    }]);
});