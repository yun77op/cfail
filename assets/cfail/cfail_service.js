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

        login: function(data) {
          var config = {
            method: 'post',
            url: '/login',
            data: data
          };
          return $http(config);
        },

        signup: function(data) {
          var config = {
            method: 'post',
            url: '/signup',
            data: data
          };
          return $http(config);
        },

        changePassword: function(data) {
          var config = {
            method: 'post',
            url: '/user/changePassword',
            data: data
          };
          var req = $http(config);

          req.then(function(resp) {
            return resp.data;
          });

          return req;
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