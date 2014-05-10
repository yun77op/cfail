var nodemailer = require('nodemailer');
var fs = require('fs');
var ejs = require('ejs');
var util = require('util');
var path = require('path');
var _ = require('lodash');

const TEMPLATE_PATH = path.join(__dirname, '..', 'api', 'email_templates');

var templates = {
  'new': {
    landing: 'user/verify_email_address',
    subject: 'Confirm email address for Cfail',
    template: 'new.ejs'
  },
  'invite_collaborator': {
    landing: 'user/verify_email_address',
    subject: 'Invitation to Cfail',
    template: 'invite_collaborator.ejs'
  }
};

var mailTransport = nodemailer.createTransport('sendmail', {
  path: '/usr/sbin/sendmail'
});

Object.keys(templates).forEach(function(emailType) {
  var template = fs.readFileSync(path.join(TEMPLATE_PATH, templates[emailType].template));
  templates[emailType].template = ejs.compile(template.toString());
});

function send(emailType, email, secret, locals, cb) {
  if (!config) throw 'No configuration';

  var emailParams = templates[emailType];
  var publicUrl = config.localAppURL  + '/' + emailParams.landing + '?token=' + encodeURIComponent(secret);

  if (interceptor) {
    interceptor(email, secret);
  } else if (config.email_to_console) {
    console.log(publicUrl);
  } else {
    var templateArgs = _.extend({
      link: publicUrl,
      format: util.format
    }, locals);

    var mailOptions = {
      from: 'Cfail <no-reply@cfail.org>',
      to: email,
      subject: emailParams.subject,
      text: emailParams.template(templateArgs)
    };

    mailTransport.sendMail(mailOptions, function(err, resp) {
      if (err) {
        config.log.error(err.message);
      } else {
        config.log.info('Mail sent: ' + resp.messageId);
      }
      if (cb) {
        cb(err, resp);
      }
    });
  }
}

var interceptor;
var config;

exports.setInterceptor = function(aInterceptor) {
  interceptor = aInterceptor;
};

exports.setConfig = function(aConfig) {
  config = _.defaults({}, aConfig, {
    localAppUrl: 'http://localhost',
    email_to_console: false,
    log: console
  });
};

exports.sendNewUserEmail = function(email, secret, locals, cb) {
  send('new', email, secret, locals, cb);
};

exports.sendInviteCollaboratorEmail = function(email, secret, locals, cb) {
  send('invite_collaborator', email, secret, locals, cb);
};

if (typeof sails !== 'undefined') {
  exports.setConfig({
    log: sails.log,
    email_to_console: sails.config.email_to_console,
    localAppUrl: sails.localAppUrl
  });
} else {
  exports.setConfig();
}
