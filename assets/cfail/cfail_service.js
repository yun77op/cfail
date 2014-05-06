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
        },

        addCollaborator: function(data) {
          var config = {
            method: 'post',
            url: '/user/addCollaborator',
            data: data
          };
          return $http(config);
        },

        getCollaboratorsByAppId: function(appId) {
          var config = {
            method: 'get',
            url: '/staged/getCollaboratorsByAppId',
            params: { appId: appId }
          };
          return $http(config);
        },

        destroyStage: function(id) {
          var config = {
            method: 'delete',
            url: '/staged/' + id,
            data: {}
          };
          return $http(config);
        }
      }
    }]);
});