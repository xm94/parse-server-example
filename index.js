// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '123123123', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["ConvertedProjects","BuildTest","Build","Project"] // List of classes to support for query subscriptions
  },
  // Enable email verification
  verifyUserEmails: true,

  // if `verifyUserEmails` is `true` and
  //     if `emailVerifyTokenValidityDuration` is `undefined` then
  //        email verify token never expires
  //     else
  //        email verify token expires after `emailVerifyTokenValidityDuration`
  //
  // `emailVerifyTokenValidityDuration` defaults to `undefined`
  //
  // email verify token below expires in 2 hours (= 2 * 60 * 60 == 7200 seconds)
  emailVerifyTokenValidityDuration: 2 * 60 * 60, // in seconds (2 hours = 7200 seconds)

  // set preventLoginWithUnverifiedEmail to false to allow user to login without verifying their email
  // set preventLoginWithUnverifiedEmail to true to prevent user from login if their email is not verified
  preventLoginWithUnverifiedEmail: false, // defaults to false

  // The public URL of your app.
  // This will appear in the link that is used to verify email addresses and reset passwords.
  // Set the mount path as it is in serverURL
  publicServerURL: 'https://app-parabeac.herokuapp.com/parse',
  // Your apps name. This will appear in the subject and body of the emails that are sent.
  appName: 'Parabeac',
  emailAdapter: {
    module: 'parse-server-mandrill-adapter',
    options: {
      // API key from Mandrill account
      apiKey: 'UXp3g42K1Hlo9nTwyKu74g',
      // From email address
      fromEmail: 'no-reply@parabeac.com',
      // Display name
      displayName: 'no-reply@parabeac.com',
      // Reply-to email address
      replyTo: 'no-reply@parabeac.com',
      // Verification email subject
      verificationSubject: 'Please verify your e-mail for *|appname|*',
      // Verification email body. This will be ignored when verificationTemplateName is used.
      verificationBody: 'Hi *|username|*,\n\nYou are being asked to confirm the e-mail address *|email|* with *|appname|*\n\nClick here to confirm it:\n*|link|*',
      // Password reset email subject
      passwordResetSubject: 'Password Reset Request for *|appname|*',
      // Password reset email body. This will be ignored when passwordResetTemplateName is used.
      passwordResetBody: 'Hi *|username|*,\n\nYou requested a password reset for *|appname|*.\n\nClick here to reset it:\n *|link|* ',

      /****************************************
       * If you are using Mandrill templates: *
       ****************************************/

      //
      // If you want to use other custom User attributes in the emails
      // (for example: firstName, lastName), add them to the list (username and email 
      // are pre-loaded).
      // The merge tag in the template must be equal to the attribute's name.
      //customUserAttributesMergeTags: ['firstname', 'lastname'],

      //
      // The name of your Mandrill template for the password reset email:
      // If you add this attribute, then passwordResetBody will be ignored.
      // IMPORTANT: Make sure the email has the *|link|* merge tag,
      //            it will render the url to reset the password.
      //passwordResetTemplateName: 'password-reset-template-name',

      //
      // The name of your Mandrill template for the verification email:
      // If you add this attribute, then verificationBody will be ignored.
      // IMPORTANT: Make sure the email has the *|link|* merge tag,
      //            it will render the url to verify the user.
      //verificationTemplateName: 'email-verification-template-name',

    },
  },
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
