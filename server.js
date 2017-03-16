'use strict';
let rp = require('request-promise'),
	fs = require('fs'),
	qs = require('querystring'),
	express = require('express'),
	app = express();
	
app.use(express.json());

function authenticate(clientID, secret, code) {
	return new Promise(function(resolve, reject) {
		let clientID = clientID;
		let secret = secret;
		let code = code;
		let data = {
			grant_type: "authorization_code",
			code: code
		};
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

// Convenience for allowing CORS on routes - GET and POST only
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', 'https://woute.github.io');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});


app.post('/authenticate', function(req, res) {
	if (req.get('origin') != 'https://woute.github.io') {
		res.status('401').send('Unauthorized');
	}
	authenticate(req.body.clientID, req.body.secret, req.body.code)
	.then(result => {
		res.send(result);
	})
	.catch(err => {
		res.status('500').send(err);
	});
});


let port = process.env.PORT || 9999;

app.listen(port, null, function (err) {
	console.log('Gatekeeper, at your service: http://localhost:' + port);
});
