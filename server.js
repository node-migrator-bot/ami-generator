var perfectapi = require('./../perfectapi/api.js');
var gen = require(__dirname + '/modules/generator/generator.js');
var path = require('path');

perfectapi.rest(path.resolve(__dirname + '/perfectapi.json'), function(err, commandName, config, callback) {
	if (err) return console.log('error: ' + err);
	
	console.log('Command called: ' + commandName);
	
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