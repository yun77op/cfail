
var assert = require('assert');
var vows = require('vows');
var email = require('../lib/mail');

var suite = vows.describe('mail');

suite.addBatch({
  'Test sendmail transport': {
    topic: function() {
      email.sendInviteCollaboratorEmail('youmail@163.com', 'secret', {
        explicitPassword: null,
        inviter: 'anonymous',
        name: 'youmail@163.com',
        appName: 'app demo'
      }, this.callback);
    },

    'done': function(err, topic) {
      assert.isNull(err);
    }
  }
});

// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
