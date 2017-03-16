'use strict';
let rp = require('request-promise'),
	fs = require('fs'),
	qs = require('querystring'),
	express = require('express'),
	app = express();
	
app.use(express.json());

function authenticate(clientID, secret, code, refresh) {
	return new Promise(function(resolve, reject) {
		console.log('Authenticating : clientID=' + clientID + ', secret=' + secret + ', code=' + code);
		let data = {
			grant_type: "authorization_code",
			code: code
		};
		if (resfresh) {
			data = {
				grant_type: "refresh_token",
				refresh_token: code
			}
		}
		let body = qs.stringify(data);
		let basic = new Buffer(clientID + ':' + secret).toString('base64');
		let options = {
			method: 'POST',
			uri: 'https://login.eveonline.com/oauth/token',
			body: body,
			headers: {
				'Authorization': 'Basic ' + basic,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Host': 'login.eveonline.com'
			}
		}
		rp(options)
		.then(response => {
			resolve(response);
		})
		.catch(err => {
			reject(err);
		});
	});
}

function verify(token) {
	return new Promise(function(resolve, reject) {
		console.log('Verifying : token=' + token);
		let options = {
			method: 'GET',
			uri: 'https://login.eveonline.com/oauth/verify',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Host': 'login.eveonline.com'
			}
		}
		rp(options)
		.then(response => {
			resolve(response);
		})
		.catch(err => {
			reject(err);
		});
	});
}

// Convenience for allowing CORS on routes - GET and POST only
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://woute.github.io');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


app.post('/authenticate', function(req, res) {
	if (req.get('origin') != 'https://woute.github.io') {
		res.status('403').send('Forbidden : Bad origin');
	}
	let data = {};
	authenticate(req.body.clientID, req.body.secret, req.body.code)
	.then(result => {
		let token = JSON.parse(result).access_token;
		data.token = token;
		data.refresh_token = JSON.parse(result).refresh_token;
		return verify(token);
	})
	.then(result => {
		data.characterID = JSON.parse(result).CharacterID;
		res.json(data);
	})
	.catch(err => {
		res.status('500').send(err);
	});
});

app.post('/refresh', function(req, res) {
	if (req.get('origin') != 'https://woute.github.io') {
		res.status('403').send('Forbidden : Bad origin');
	}
	let data = {};
	authenticate(req.body.clientID, req.body.secret, req.body.code, true)
	.then(response => {
		let result = JSON.parse(response);
		let token = result.access_token;
		data.token = token;
		data.refresh_token = result.refresh_token;
		res.json(data);
	})
	.catch(err => {
		res.status('500').send(err);
	});
});

let port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
	console.log('Gatekeeper, at your service: http://localhost:' + port);
});
