var ec2 = require("ec2");

exports.generateInstance = function(userData, baseAMI, uniqueName, callback) {
   
    // Create an instance of the AmazonEC2Client.
    var client = ec2.createClient(
        { key:      process.env["AWS_ACCESS_KEY_ID"]
        , secret:   process.env["AWS_SECRET_ACCESS_KEY"]
    });
            
    // Track the progress of the API invocation in the lexical scope.
    var instanceId, 
        reservationId,
        newImageId;
        
    // Call the "RunInstances" action to create a new EC2 instance. The Amazon Query
    // API call will return immediately, but the instance will take a while to initialize.
    client.call("RunInstances", {
      ImageId: baseAMI, 
      UserData: userData,   
      InstanceType: "t1.micro",
	  //ClientToken: name,			//this allows that we can run concurrently with other processes, or restart after a failure
      MinCount: 1, MaxCount:1
    }, function (response) {
      reservationId   = response.reservationId;
      instanceId      = response.instancesSet[0].instanceId;

	  //console.log(response);
	  pollForReady(client, instanceId);
    });

	client.on("error", function (err) {
		if (err=="Error: connect Unknown system errno 10060") {
			//lets assume the timeout is on the pollForStopped.  In that case, we can ignore the error
			console.log('Encountered ' + err + '.  Ignoring & restarting polling');
			pollForStopped(client, reservationId, instanceId);
			client.execute();
		} else {
			callback('error generating instance - ' + err);
		}
    });
	
    // When all of the Amazon Query API calls and polls complete, we know that our
    // Amazon EC2 instance is ready for use.
    client.on("end", function () {
      console.log("Instance created with id: " + instanceId);
      callback(null, instanceId);
    });
    
    // Run the trasaction described above.
    client.execute();   

};

function pollForReady(client, instanceId) {
    //We poll the  "DescribeInstances" action, calling it once every
    // second until the instance state indicates that it is done.
    client.poll("DescribeInstances",  {
        "Filter.1.Name": "instance-id", 
        "Filter.1.Value.1": instanceId,
		"Filter.2.Name": "instance-state-name",
		"Filter.2.Value": "running"
    }, function (result) {
		if (result.reservationSet.length > 0) {
			console.log('Instance ' + instanceId + ' is running');
			client.call("CreateTags", {
				"ResourceId.1": instanceId,
				"Tag.1.Key": "generator",
				"Tag.1.Value": "https://github.com/perfectapi/ami-generator",
				"Tag.2.Key": "generatedOnOS",
				"Tag.2.Value": process.platform
			}, function(response) {
				//tags done
				console.log('Tagged instance ' + instanceId);
			});
			
			pollForStopped(client, instanceId);
			
			return true;
		} else {
			return false;
		}
	});
}

function pollForStopped(client, instanceId) {
    //We poll the  "DescribeInstances" action, calling it once every
    // second until the instance state indicates that it is done.
    client.poll("DescribeInstances",  {
        "Filter.1.Name": "instance-id", 
        "Filter.1.Value.1": instanceId,
		"Filter.2.Name": "instance-state-name",
		"Filter.2.Value": "stopped"
    }, function (result) {
		return (result.reservationSet.length > 0);
	});
}