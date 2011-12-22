var fs = require('fs');
var path = require('path');
var express = require('express');

exports.parse = function(callback) {
	var perfectapiPath = path.resolve(__dirname, '..', '..', 'perfectapi.json');
	var perfectapiJson = JSON.parse(fs.readFileSync(perfectapiPath)); 
	var commands = perfectapiJson.signature;

	var packagePath = path.resolve(__dirname, '..', '..', 'package.json');
	var version = JSON.parse(fs.readFileSync(packagePath)).version; 
	
	var app = express.createServer();
	app.configure(function(){
		//app.use(express.methodOverride());
		app.use(express.bodyParser());
		//app.use(app.router);
	});
	
	app.get('/version', function(req, res, next){
		res.end(version);
	});
	
	for (var i=0;i<commands.length;i++) {
	
		setupListener(app, commands[i], callback);
	};
	
	app.listen(3000);
};

function setupListener(app, command, callback) {
	var name = command.name;
	var part = command.path;
	
	app.all(part, function(req, res, next) {
		if (req.accepts('application/json')) {
			var config = req.body;
			if (command.environment) {
				var environment = command.environment;
				var json = "{"
				var sep = "";
				for(var i=0;i<environment.length;i++) {
					var value = req.header(environment[i].parameter, null);
					if (!value) value = process.env[environment[i].parameter]; 
					if (!value) { 
						var err = 'Expected environment parameter ' + environment[i].parameter
						res.end(err);
						return callback(err);
					}
					json += sep + '"' + environment[i].parameter + '":"' + value + '"'
					sep = ","
				}
				json += "}";
				config.environment = JSON.parse(json);  //safer than using eval
			}
		
			//res.end('Accepted request to ' + part);
			callback(null, name, config, function(err, result) {
				res.end(result);
			});
		} else {
			res.end('Only accepting json requests right now (application/json)');
		}
	});
}

