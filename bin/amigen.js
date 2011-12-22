#!/usr/bin/env node

var perfectapi = require('../../perfectapi/api.js');  
var gen = require('../modules/generator/generator.js');
var path = require('path');
var fs = require('fs');

var packagePath = path.resolve(__dirname, '..', 'package.json');
var packageJson = JSON.parse(fs.readFileSync(packagePath)); 

perfectapi.commandline(path.resolve(__dirname, '..', 'perfectapi.json'), function(commandName, config) {
	switch (commandName) {
		case 'gen': 
			generate(config);
			break;
		case 'scripts':
			listScripts(config);
			break;
	}
});

function validateConfig(config) {
	var options = config.options;
	options.root = options.root || path.resolve(__dirname, '../scripts');

	if (!path.existsSync(options.root)) {
		console.log();
		console.log('Scripts path "' + options.root + '" does not exist');
		process.exit(1);
	}
	
	return config;
}

function listScripts(config) {
	var config = validateConfig(config);
	var options = config.options;
	
	var paths = [];
	walkPathSync(options.root, '', paths);
	console.log(paths);

	process.exit(1);
}

function generate(config) {
	console.log('generating...');
	config = validateConfig(config);

	gen.getImageUsingConfig(config, function(err, amiId) {
		if (err) {
			console.log(err);
		} else {
			console.log('ok, done - amiId = ' + amiId);
		}
	});
}

function walkPathSync(root, currentPath, results) {
	results = results || [];
	
	var files = fs.readdirSync(path.resolve(root, currentPath));
	for (var i=0;i<files.length;i++) {
		var currentFileResolved = path.resolve(root, currentPath, files[i]);
		var isDir = fs.statSync(currentFileResolved).isDirectory();
		
		if (isDir) {
			var result = path.join(currentPath, files[i])
			results.push(result);
			walkPathSync(root, result, results);
		}
	}
}

