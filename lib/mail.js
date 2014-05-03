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
  }
};

var sendmailTransport = nodemailer.createTransport('sendmail');

Object.keys(templates).forEach(function(emailType) {
  var template = fs.readFileSync(path.join(TEMPLATE_PATH, templates[emailType].template));
  templates[emailType].template = ejs.compile(template.toString());
});

function send(emailType, email, secret, locals) {
  var emailParams = templates[emailType];
  var publicUrl =  sails.localAppURL + '/' + emailParams.landing + '?token=' + encodeURIComponent(secret);

  if (interceptor) {
    interceptor(email, secret);
  } else if (sails.config.email_to_console) {
    sails.log.debug(publicUrl);
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

    sendmailTransport.sendMail(mailOptions, function(err) {
      if (err) {
        sails.log.error(err.message);
      }
    });
  }
}

var interceptor;

exports.setInterceptor = function(aInterceptor) {
  interceptor = aInterceptor;
};

exports.sendNewUserEmail = function(email, secret, locals) {
  send('new', email, secret, locals);
};