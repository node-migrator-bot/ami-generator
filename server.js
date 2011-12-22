var rest = require('./modules/perfectapi/restgen.js');
var gen = require(__dirname + '/modules/generator/generator.js');

rest.parse(function(err, commandName, config, callback) {
	if (err) return console.log('error: ' + err);
	
	console.log('Command called: ' + commandName);
	//console.log('Config is: ' + JSON.stringify(config));
	
	if (commandName == 'gen') {
		gen.getImageUsingConfig(config, function(err, result) {
			callback(err, result);
		});
	} else if (commandName == 'scripts') {
		//todo
	} else {
		callback('Command ' + commandName + ' is not supported');
	}

});