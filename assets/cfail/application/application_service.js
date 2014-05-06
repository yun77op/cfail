define(['angular', 'ap.config'], function(angular, gconfig) {

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
        },

        stage: function(data) {
          var config = {
            method: 'post',
            url: '/staged/create',
            data: data
          };
          config.data.userName = gconfig.user.name;
          return $http(config);
        }
      }
    }]);
});