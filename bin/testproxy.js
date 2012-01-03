var perfectapi = require('../../perfectapi/api.js');

perfectapi.proxy('http://localhost:3000/apis', function(err, api) {

	console.log(JSON.stringify(api));
	
	var config = {   
		"root": "./node_modules/amigen/scripts"
	,   "baseAMI": "ami-a562a9cc"
	,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/nodejs-latest"]
	};

	api.scripts(config, function(err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log('ok, done - result = ' + JSON.stringify(result));
		}
	});
});

