var perfectapi = require('../../perfectapi/api.js');

perfectapi.proxy('http://localhost:3000/apis', function(err, amigen) {

	//console.log(JSON.stringify(amigen));
	
	var config = {   
		"root": "./node_modules/amigen/scripts"
	,   "baseAMI": "ami-a562a9cc"
	,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/nodejs-latest"]
	};

	amigen.scripts(config, function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log('ok, done - result = ' + JSON.stringify(result));
		}
	});
	
	amigen.gen(config, function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log('ok, done - result = ' + JSON.stringify(result));
		}
	});
});

var amigen = require('./amigen.js');

var config = {   
	"root": "./node_modules/amigen/scripts"
,   "baseAMI": "ami-a562a9cc"
,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/nodejs-latest"]
};

amigen.scripts(config, function(err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log('ok, done - result = ' + JSON.stringify(result));
	}
});

amigen.gen(config, function(err, result) {
	if (err) {
		console.log(err);
	} else {
		console.log('ok, done - result = ' + JSON.stringify(result));
	}
});