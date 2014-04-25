define(['angular'], function(angular) {

  angular.module('application.service', []).
    factory('applicationService', ['$http', function($http) {
      return {
        create: function(data) {
          var config = {
            method: 'post',
            url: '/application/create',
            data: data
          };
          return $http(config);
        }
      }
    }]);
});