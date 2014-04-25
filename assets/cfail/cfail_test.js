describe('cfail_test', function() {
  beforeEach(module('cfail.filter'));

  describe('ua', function() {
    it('should parse ua', inject(function(uaFilter) {
      expect(uaFilter('Mac OS X 10.9.2')).toEqual('mac');
      expect(uaFilter('Windows 7')).toEqual('windows');
    }));
  });
});