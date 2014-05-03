
var wsapi = require('./lib/wsapi');
var assert = require('assert');
var vows = require('vows');

var suite = vows.describe('stage-user');


suite.addBatch({
  'Staging an account': {
    topic: wsapi.post('/signup', { name: 'yun77op@163.com', passwd: 'sdfvv6', role: 'admin' }),

    'success': function(err, resp) {
      assert.isNull(err);
      assert.strictEqual(resp.code, 200);
    },

    'then destroy the account': {
      topic: function(resp) {
        if (resp.code == 200) {
          var body = JSON.parse(resp.body);
          wsapi.post('/user/destroy', { id: body.user.id }).apply(this, arguments);
        } else {
          this.callback(null, { code: 500 });
        }
      },

      'success': function(err, resp) {
        assert.strictEqual(resp.code, 200);
      }
    }
  }
});

suite.addBatch({
  'Staging an account with pass\'s length is 3, less than the minimal length of 4': {
    topic: wsapi.post('/signup', { name: 'stageUser2@163.com', passwd: 'sd3', role: 'admin' }),

    'not work': function(err, resp) {
      assert.isNull(err);
      assert.notEqual(resp.code, 200);
      var body = JSON.parse(resp.body);
      assert.strictEqual(body.errors[0].ValidationError.passwd[0].rule, 'minLength');
      assert.strictEqual(body.errors[0].ValidationError.passwd[0].args[0], 6);
    }

  }
});


// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
