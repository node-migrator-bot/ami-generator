#!/usr/bin/env node

//var perfectapi = require('perfectapi');    
var perfectapi = require('../../perfectapi/api.js');  
var gen = require('../modules/generator/generator.js');
var path = require('path');
var fs = require('fs');

var configPath = path.resolve(__dirname, '..', 'perfectapi.json');
var parser = new perfectapi.Parser();

parser.on("gen", function(config, callback) {
	config = validateConfig(config, function(err, config) {
		if (err) {
			callback(err, null);
		} else {
			console.log('generating...');

			gen.getImageUsingConfig(config, function(err, amiId) {
				if (err) {
					callback(err);
				} else {
					var result = {};
					result.ami = amiId;
					console.log('ok, done - amiId = ' + amiId);
					
					callback(null, result);
				}
			});
		}
	});
});
 
parser.on("scripts", function(config, callback) {
	config = validateConfig(config, function(err, config) {
		if (err) {
			callback(err, null);
		} else {
			var options = config.options;
		
			var paths = [];
			walkPathSync(options.root, '', paths);
			
			var result = {};
			result.scripts = paths;
			callback(null, result);			
		}
	});
});

//expose our API in normal "exports" fashion.  2 ways, either through api.xyz(config, callback): 
var api = parser.parse(configPath);
exports.api = api;
//...or directly by xyz(config, callback):
for( var myFunc in api ) {
	exports[myFunc] = api[myFunc];
}

function validateConfig(config, callback) {
	var options = config.options;
	options.root = options.root || path.resolve(__dirname, '../scripts');

	if (!path.existsSync(options.root)) {		
		callback('Scripts path "' + options.root + '" does not exist');
	} else {
		callback(null, config);
	}
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

