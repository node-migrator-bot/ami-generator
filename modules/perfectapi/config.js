var fs = require('fs');
var path = require('path');

exports.getCommands = getCommands;

function getCommands() {
	var perfectapiPath = path.resolve(__dirname, '..', '..', 'perfectapi.json');
	var perfectapiJson = JSON.parse(fs.readFileSync(perfectapiPath)); 
	var commands = perfectapiJson.signature;

	return commands;
}

function getCommandByName(commandName) {
	var commands = getCommands();
	for (var i=0;i<commands.length;i++) {
		if (commands[i].name == commandName) return commands[i];
	}
	
	return null;
}

exports.getCommandParameterName = function(commandName) {

	return getCommandByName(commandName).parameter.name;
}

exports.getDefaultConfig = function(commandName) {
	var command = getCommandByName(commandName);
	
	var config = {};
	
	//environment
	var environment = {};
	if (command.environment) {
		for(var i=0;i<command.environment.length;i++) {
			var env = command.environment[i];
			environment[env.parameter] = "";
			
			//preset it to a default based on current environment
			if (process.env[env.parameter])
				environment[env.parameter] = process.env[env.parameter];
		};
	};
	config.environment = environment;
	
	//parameter
	if (command.parameter) {
		if (command.parameter.type && command.parameter.type=='multi')
			config[command.parameter.name] = [];
		else
			config[command.parameter.name] = "";
	};
	
	//options
	var options = {};
	if (command.options) {
		for(var i=0;i<command.options.length;i++) {
			var option = command.options[i];
			
			if (option.option) {
				options[option.option] = option.default || "";
			} else {
				options[option.flag] = option.default || false;
			}
		}
	};
	config.options = options;
	
	//console.log(JSON.stringify(config));
	
	return config;
}

//http://stackoverflow.com/questions/7997342/merge-json-objects-without-new-keys
function merge(defaultConfig, additionalConfig) {
    for( var p in additionalConfig )
        if( defaultConfig.hasOwnProperty(p) ) 
            defaultConfig[p] = (typeof additionalConfig[p] === 'object' && !(p.length)) ? merge(defaultConfig[p], additionalConfig[p]) : additionalConfig[p];
		
    return defaultConfig;
}

exports.merge = merge;