var fs = require('fs');
var path = require('path');
var program = require('commander');

exports.parse = function(callback) {
	var perfectapiPath = path.resolve(__dirname, '..', '..', 'perfectapi.json');
	var perfectapiJson = JSON.parse(fs.readFileSync(perfectapiPath)); 
	var commands = perfectapiJson.signature;

	var packagePath = path.resolve(__dirname, '..', '..', 'package.json');
	var version = JSON.parse(fs.readFileSync(packagePath)).version; 
	program.version(version);
	
	for (var i=0;i<commands.length;i++) {
		var command = commands[i];
		var name = command.name;
		if (command.parameter) {
			var multi = (command.parameter.type=='multi') ? '..' : '';
			if (command.parameter.required) {
				name += ' <' + command.parameter.name + multi + '>';
			} else
				name += ' [' + command.parameter.name + multi + ']';
		} else {
			//name is sufficient
		}
		
		var cmd = program
			.command(name)
			.description(command.synopsis)
			.action(function() {
				//we pass back all the arguments + our command name + the options object
				//console.log(arguments);
				var options = arguments[arguments.length-1];
				var commandName = options.name;
				var args = [commandName, options];
				var parameters = [];
				for (var i=0;i<arguments.length-1;i++) 
					parameters.push(arguments[i]);
					
				args.push(parameters);
				callback(commandName, options, parameters);
				//callback.apply(this, args);
			});
		
		var options = command.options;
		for (var j=0;j<options.length;j++) {
			var option = options[j];
			if (option.option) {
				var optionText = '-' + option.short + ', --' + option.long;
				if (option.required)
					optionText += ' <' + option.option + '>'
				else
					optionText += ' [' + option.option + ']';
				
				if (option.default) 
					cmd.option(optionText, option.description, option.default);
				else
					cmd.option(optionText, option.description);
			} else if (option.flag) {
				var optionText = '-' + option.short + ', --' + option.long;
				cmd.option(optionText, option.description);
			}
		}
	}
	
	program.parse(process.argv);
};

function list(val) {
  return val.split(',');
}