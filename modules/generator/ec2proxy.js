var ec2 = require("ec2");
var logger = require('winston').loggers.get('amigen-console');

call = function(config, command, parameters, callback) {

	// Create an instance of the AmazonEC2Client.
	var client = ec2.createClient(
		{ key:      config.AWS_ACCESS_KEY_ID
		, secret:   config.AWS_SECRET_ACCESS_KEY
		, endpoint: config.endpoint || "us-east-1"
	});
	
	var errState = false;
	
	//console.log('using endpoint ' + config.endpoint);
	
	client.call(command, parameters, function(response) {
		if (errState)
			logger.error('This should not happen!')
		else if (!response) {
			//strange scenario - null response means err, but we don't know what it is.
			callback('unknown ec2 error');
		} else
			callback(null, response);
		
	});
	
	client.on("error", function(err, err2) {
		if (err=="Error: connect Unknown system errno 10060") {
			//retry, its a connection timeout
			client.call(command, parameters, function(response) {
				callback(null, response);
			});
			
			client.execute();
		} else {
			errState = true;
			callback(err || err2);
		}
	});
	
	client.on("end", function() {
		//not really useful since we aren't using the command stack
	});
	
	client.execute();
};

exports.call = call;

exports.waitForInstanceState = function(config, instanceId, requiredState, frequencyMilliseconds, callback) {
	//valid instance states are pending | running | shutting-down | terminated | stopping | stopped,
	//BUT you can only wait for running | terminated | stopped, because others may pass too quickly
	var done = false;
	var intervalId = setInterval(function() {
		call(config, "DescribeInstances",  {
			"Filter.1.Name": "instance-id", 
			"Filter.1.Value.1": instanceId,
			"Filter.2.Name": "instance-state-name",
			"Filter.2.Value": requiredState}, function(err, response) {
		
			if (err) 
				return logger.error(err);

			if (!response || !(response.reservationSet) || response.reservationSet.length==0) {
				//noop, still waiting
			} else {
				//done waiting, it is ready
				clearInterval(intervalId);
				if (!done) {
					done = true;
					callback(null, instanceId);
				}
			}
		});
	}, frequencyMilliseconds);
};

exports.waitForInstanceExists = function(config, instanceId, frequencyMilliseconds, callback) {
	var done = false;
	var intervalId = setInterval(function() {
		call(config, "DescribeInstances",  {
			"Filter.1.Name": "instance-id", 
			"Filter.1.Value.1": instanceId}, function(err, response) {
		
			if (err) 
				return logger.error(err);

				if (!response || !(response.reservationSet) || response.reservationSet.length==0) {
				//noop, still waiting
			} else {
				//done waiting, it is ready
				clearInterval(intervalId);
				if (!done) {
					done = true;
					callback(null, instanceId);
				}
			}
		});
	}, frequencyMilliseconds);
};

exports.waitForImageState = function(config, imageId, requiredState, frequencyMilliseconds, callback) {
	//valid image states are available | pending | failed,
	//BUT you can only wait for available | failed, because pending may pass too quickly 
	var done = false;
	var intervalId = setInterval(function() {
		call(config, "DescribeImages",  {
			"Filter.1.Name": "image-id", 
			"Filter.1.Value.1": imageId,
			"Filter.2.Name": "state",
			"Filter.2.Value": requiredState}, function(err, response) {
		
			if (err) 
				return logger.error(err);
				
			if (!response || !(response.imagesSet) || response.imagesSet.length==0) {
				//noop, still waiting
			} else {
				//done waiting, it is ready
				clearInterval(intervalId);
				if (!done) {
					done = true;
					callback(null, imageId);
				}
			}
		});
	}, frequencyMilliseconds);
};

exports.waitForImageExist = function(config, imageId, frequencyMilliseconds, callback) {
	//basically same as wait for image state = pending
	var done = false;
	var intervalId = setInterval(function() {
		call(config, "DescribeImages",  {
			"Filter.1.Name": "image-id", 
			"Filter.1.Value.1": imageId}, function(err, response) {
		
			if (err) 
				return logger.error(err);

				if (!response || !(response.imagesSet) || response.imagesSet.length==0) {
				//noop, still waiting
			} else {
				//done waiting, image exists
				clearInterval(intervalId);
				if (!done) {
					done = true;
					callback(null, imageId);
				}
			}
		});
	}, frequencyMilliseconds);
};