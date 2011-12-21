#!/usr/bin/env node

var cli = require('../modules/perfectapi/cligen.js');
var gen = require('../modules/generator/generator.js');
var path = require('path');
var fs = require('fs');

var packagePath = path.resolve(__dirname, '..', 'package.json');
var packageJson = JSON.parse(fs.readFileSync(packagePath)); 

cli.parse(function(commandName, options, parameters) {
	//console.log(commandName);
	//console.log(options);
	switch (commandName) {
		case 'gen': 
			options.scripts = parameters;
			generate(options);
			break;
		case 'scripts':
			listScripts(options);
			break;
	}
});

function validateOptions(options) {
	options.ami = options.ami || 'ami-bf62a9d6';
	options.root = options.root || path.resolve(__dirname, '../scripts');
	options.scripts = options.scripts || [];

	if (!path.existsSync(options.root)) {
		console.log();
		console.log('Scripts path "' + options.root + '" does not exist');
		process.exit(1);
	}
	
	return options;
}

function listScripts(options) {
	options = validateOptions(options);
	
	var paths = [];
	walkPathSync(options.root, '', paths);
	console.log(paths);

	process.exit(1);
}

function generate(options) {
	console.log('generating...');
	options = validateOptions(options);

	if (options.scripts.length == 0) {
		console.log();
		console.log('The scripts parameter is required, e.g. amigen gen ubuntu11.10/node-latest.  Use the scripts command to list available scripts.');
		console.log();
	}

	var config = {   
			"root": options.root
		,   "baseAMI": options.ami
		,   "scripts": options.scripts
		};

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

