var perfectapi = require('./../perfectapi/api.js');
var gen = require('./modules/generator/generator.js');
var path = require('path');
var express = require('express');

var app = express.createServer();

app.configure(function(){
	app.use(express.bodyParser());
	app.use(perfectapi.restify(path.resolve(__dirname + '/perfectapi.json')));
});

app.post('/gen', function(req, res) {
	var config = req.perfectapi.config;
	
	gen.getImageUsingConfig(config, function(err, result) {
		if (err) 
			res.end('Bad request - ' + err)
		else
			res.end(result);
	});
});

app.post('/scripts', function(req, res) {
	var config = req.perfectapi.config;
	
	res.end('Not supported yet');
});

app.listen(3000);