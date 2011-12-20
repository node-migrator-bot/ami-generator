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
	  poll(client, reservationId, instanceId);
    });

	client.on("error", function (err) {
		if (err=="Error: connect Unknown system errno 10060") {
			//lets assume the timeout is on the poll.  In that case, we can ignore the error
			console.log('Encountered ' + err + '.  Ignoring & restarting polling');
			poll(client, reservationId, instanceId);
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

function poll(client, reservationId, instanceId) {
    //We poll the  "DescribeInstances" action, calling it once every
    // second until the instance state indicates that it is done.
    client.poll("DescribeInstances",  {
        "Filter.1.Name": "reservation-id", 
        "Filter.1.Value.1": reservationId
    }, function (struct) {
		var reservation = struct.reservationSet.filter(function (reservation) {
			return reservation.reservationId == reservationId;
		})[0];
		if (reservation) {
			var instance = reservation.instancesSet.filter(function (instance) {
				return instance.instanceId == instanceId;
			})[0];

			//console.log('polling for instance to finish...')
			if (instance.instanceState.name == "stopped") {
				//because the script automatically stops the instance once user-data.sh completes
				client.call("CreateTags", {
					"ResourceId.1": instanceId,
					"Tag.1.Key": "generator",
					"Tag.1.Value": "https://github.com/perfectapi/ami-generator"
				}, function(response) {
					//tags done
					console.log('Tagged instance ' + instanceId);
				});
				
				return true;
			} else {
				return false;
			}
		} else {
			//happens when the original RunInstances call has not yet returned. (It returns "immediately", but still async)
			return false;
		}
	});
}