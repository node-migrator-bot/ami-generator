#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var gen = require('../modules/generator/generator.js');
var path = require('path');

program
  .usage('[options] scripts')
  .option('-r, --root', 'Root path to user-data scripts')
  .option('-a, --ami', 'Base AMI image name')
  
program.on('--help', function(){
  console.log('  Examples:');
  console.log('');
  console.log('    $ amigen ubuntu11.10/node-latest ubuntu11.10/juju');
  console.log('    $ amigen -a ami-bf62a9d6 ubuntu11.10/juju');
  console.log('');
});

program.parse(process.argv);

program.ami = program.ami || 'ami-bf62a9d6';
program.root = program.root || path.resolve(__dirname, '../scripts');
program.scripts = program.args || [];

if (program.scripts.length == 0) {
	console.log('The scripts parameter is required, e.g. amigen ubuntu11.10/node-latest');
	process.exit(1);
}

if (!path.existsSync(program.root)) {
	console.log('Scripts path "' + program.root + '" does not exist');
	process.exit(1);
}

var config = {   
        "root": program.root
    ,   "baseAMI": program.ami
    ,   "scripts": program.scripts
    };

gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});