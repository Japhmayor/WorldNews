'use strict';
/* jshint node: true */

var express = require('express');

var portno = 5000;   // Port number to use

var app = express();

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

var server = app.listen((process.env.PORT || portno ), function () {
  var port = server.address().port;
  console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
