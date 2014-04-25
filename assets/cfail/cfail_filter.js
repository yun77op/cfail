define(['angular'], function(angular) {

  angular.module('cfail.filter', []).
    filter('ua', function() {
      return function(input) {
        var supportedVendors = ['firefox', 'safari', 'chrome', 'mac', 'windows', 'linux', 'ie'];
        var vendor = input.split(' ')[0].toLowerCase();
        return supportedVendors.indexOf(vendor) === -1 ? 'unknown' : vendor;
      };
    });
});