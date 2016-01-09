'use strict';

var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');

var httpPort  = 8080;
var httpsPort = 8443;


var app = express();

// your express configuration here

var httpServer = http.createServer(app).listen(httpPort, function () {
  console.log('* HTTP Server listening at ' + httpServer.address().port);
});

var httpsOptions = {
  key:  fs.readFileSync('selfsigned.key', 'utf8'),
  cert: fs.readFileSync('selfsigned.crt', 'utf8')
};

var httpsServer = https.createServer(httpsOptions, app).listen(httpsPort, function () {
  console.log('* HTTPS Server listening at ' + httpsServer.address().port);
});


// mini-https-redirect

//app.use( require('../index')({ httpsPort: httpsPort }) );

app.use( require('../index')({ httpsPort: httpsPort, redirect: false }) );


// Reply with '200 OK' on any request

app.get('*', function(req, res) {
  res
    .status(200)
    .send('OK');
});

