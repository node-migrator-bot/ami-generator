var ec2 = require(__dirname + "/ec2proxy.js");

exports.generateInstance = function(userData, baseAMI, uniqueName, callback) {
   
    var ec2config = {
		"AWS_ACCESS_KEY_ID": process.env["AWS_ACCESS_KEY_ID"],
		"AWS_SECRET_ACCESS_KEY": process.env["AWS_SECRET_ACCESS_KEY"] };
            	
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

		ec2.waitForInstanceState(ec2config, instanceId, 'running', 5000, function (result) {
			console.log('Instance ' + instanceId + ' is running');
			ec2.call(ec2config, "CreateTags", {
				"ResourceId.1": instanceId,
				"Tag.1.Key": "generator",
				"Tag.1.Value": "https://github.com/perfectapi/ami-generator",
				"Tag.2.Key": "generatedOnOS",
				"Tag.2.Value": process.platform,
				"Tag.3.Key": "Name",
				"Tag.3.Value": "Temporary instance"
			}, function(response) {
				//tags done
				console.log('Tagged instance ' + instanceId);
			});
		});
		
		ec2.waitForInstanceState(ec2config, instanceId, 'stopped', 30000, function (result) {
			console.log("Instance created with id: " + instanceId);
			callback(null, instanceId);
		});
	});
};
