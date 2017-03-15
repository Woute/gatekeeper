'use strict';
let rp = require('request-promise'),
	fs = require('fs'),
	qs = require('querystring'),
	express = require('express'),
	app = express();
	
app.use(express.json());

function authenticate(body) {
	return new Promise(function(resolve, reject) {
		resolve(body);
	});
}

// Convenience for allowing CORS on routes - GET and POST only
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://woute.github.io/'); 
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); 
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.post('/authenticate', function(req, res) {
	console.log('authenticating code:' + req.body);
	authenticate(req.body)
	.then(result => {
		res.json(result);
	});
});

let port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
	console.log('Gatekeeper, at your service: http://localhost:' + port);
});
