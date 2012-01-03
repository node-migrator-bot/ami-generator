var perfectapi = require('../../perfectapi/api.js');

var gen = perfectapi.proxy('http://localhost:3000/apis');

console.log(JSON.stringify(gen));

setTimeout(function() {
	console.log(JSON.stringify(gen));
	
	var config = {   
		"root": "./node_modules/amigen/scripts"
	,   "baseAMI": "ami-a562a9cc"
	,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/nodejs-latest"]
	};

	gen.getImageUsingConfig(config, function(err, amiId) {
		if (err) {
			console.log(err);
		} else {
			console.log('ok, done - amiId = ' + amiId);
		}
	});
	
}, 3000);
	

/*


*/