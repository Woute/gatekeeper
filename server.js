'use strict';
let url = require('url'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	qs = require('querystring'),
	express = require('express'),
	app = express();

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
	let config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
	for (let i in config) {
		config[i] = process.env[i.toUpperCase()] || config[i];
	}
	console.log('Configuration');
	console.log(config);
	return config;
}

let config = loadConfig();

function authenticate(code, refresh, cb) {
	let data = qs.stringify({
		grant_type: 'authorization_code',
		code: code
	});
	if (refresh) {
		data = qs.stringify({
			grant_type: 'refresh_token',
			refresh_token: code
		});
	}
	
	let auth = new Buffer(config.oauth_client_id + ':' + config.oauth_client_secret).toString('base64');
	let reqOptions = {
		host: config.oauth_host,
		path: config.oauth_path,
		method: config.oauth_method,
		port: config.oauth_port,
		headers: { 
		'Authorization': 'Basic ' + auth,
		'Content-Type': 'application/x-www-form-urlencoded',
		'Host': config.oauth_host
	}
	};

	let body = "";
	let req = https.request(reqOptions, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) { body += chunk; });
		res.on('end', function() {
			cb(null, JSON.parse(body).access_token);
		});
	});

	req.write(data);
	req.end();
	req.on('error', function(e) { cb(e.message); });
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); 
	res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.get('/authenticate/:code', function(req, res) {
	console.log('authenticating code:' + req.params.code);
	authenticate(req.params.code, false, function(err, token) {
		let result = err || !token ? {"error": "bad_code"} : { "token": token };
		console.log(result);
		res.json(result);
	});
});

app.get('/refresh/:code', function(req, res) {
	console.log('refreshing code:' + req.params.code);
	authenticate(req.params.code, true, function(err, token) {
		let result = err || !token ? {"error": "bad_code"} : { "token": token };
		console.log(result);
		res.json(result);
	});
});

let port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
	console.log('Gatekeeper, at your service: http://localhost:' + port);
});
