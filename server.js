var rest = require('./modules/perfectapi/restgen.js');


rest.parse(function(err, commandName, config, callback) {
	if (err) return console.log('error: ' + err);
	
	console.log('Command called: ' + commandName);
	console.log('Config is: ' + JSON.stringify(config));
	
	callback(null, 'Thanks');
});