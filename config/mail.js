module.exports.mail = {
  transport: 'SMTP',

  options: {
    port           : process.env['MAILGUN_SMTP_PORT'],
    host           : process.env['MAILGUN_SMTP_SERVER'],
    auth: {
      user        : process.env['MAILGUN_SMTP_LOGIN'],
      pass        : process.env['MAILGUN_SMTP_PASSWORD']
    },
    requiresAuth: true,
    authentication : 'plain'
  }
};