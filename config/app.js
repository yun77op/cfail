module.exports = {
  appName: 'Cfail',

  email_to_console: false,

  paths: {
    public: process.cwd() + (process.env.PUBLIC_DIR || '/.tmp/public')
  }

};