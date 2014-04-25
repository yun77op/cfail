define(['angular'], function(angular) {

  angular.module('cfail.service', []).
    factory('cfailService', ['$http', function($http) {
      return {
        signout: function() {
          var config = {
            method: 'post',
            url: '/signout',
            data: {}
          };
          return $http(config).
            success(function() {
              location.href = '/';
            });
        }
      }
    }]);
});