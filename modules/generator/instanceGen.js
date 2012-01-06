var ec2 = require(__dirname + "/ec2proxy.js");

exports.generateInstance = function(userData, baseAMI, uniqueName, config, callback) {
   
  var ec2config = {
		"AWS_ACCESS_KEY_ID": config.environment.AWS_ACCESS_KEY_ID,
		"AWS_SECRET_ACCESS_KEY": config.environment.AWS_SECRET_ACCESS_KEY,
		"endpoint": config.options.region};
  
	//first lets check if this instance already exists
	ec2.call(ec2config, "DescribeInstances",  {
		"Filter.1.Name": "tag:uniqueName", 
		"Filter.1.Value.1": uniqueName}, function(err, response) {
	
		console.log(0);

		if (err) return callback(err);
		
		console.log(1);
		
		if (response.reservationSet 
		&& response.reservationSet.length > 0
		&& response.reservationSet[0].instancesSet) {
			//we have an existing instance - just tag onto that one
		console.log(2);
			var instanceId = response.reservationSet[0].instancesSet[0].instanceId;
			
			console.log("Instance already exists with id: " + instanceId);
			waitForStopped(ec2config, instanceId, callback);
		} else {
		console.log(3);
			// Call the "RunInstances" action to create a new EC2 instance. The Amazon Query
			// API call will return immediately, but the instance will take a while to initialize.
			ec2.call(ec2config, "RunInstances", {
				ImageId: baseAMI, 
				UserData: userData,   
				InstanceType: "t1.micro",
			//ClientToken: name,			//this allows that we can run concurrently with other processes, or restart after a failure
				MinCount: 1, MaxCount:1
			}, function (err, response) {
				var instanceId = response.instancesSet[0].instanceId;

				ec2.waitForInstanceExists(ec2config, instanceId, 5000, function (result) {
					console.log('Instance ' + instanceId + ' is running');
					ec2.call(ec2config, "CreateTags", {
						"ResourceId.1": instanceId,
						"Tag.1.Key": "generator",
						"Tag.1.Value": "https://github.com/perfectapi/ami-generator",
						"Tag.2.Key": "generatedOnOS",
						"Tag.2.Value": process.platform,
						"Tag.3.Key": "Name",
						"Tag.3.Value": "Temporary instance",
						"Tag.4.Key": "uniqueName",
						"Tag.4.Value": uniqueName			
					}, function(err, response) {
						//tags done
						console.log('Tagged instance ' + instanceId);
					});
				});
				
				console.log("Instance created with id: " + instanceId);
				waitForStopped(ec2config, instanceId, callback);
				
			});
		};		
	});
}

function waitForStopped(ec2config, instanceId, callback) {
	ec2.waitForInstanceState(ec2config, instanceId, 'stopped', 30000, function (result) {
		callback(null, instanceId);
	});
}