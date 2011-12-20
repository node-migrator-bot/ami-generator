var ec2 = require("ec2");

exports.generateAMI = function(instanceId, uniqueName, lineage, tag, callback) {
    // Create an instance of the AmazonEC2Client.
    var client = ec2.createClient(
        { key:      process.env["AWS_ACCESS_KEY_ID"]
        , secret:   process.env["AWS_SECRET_ACCESS_KEY"]
    });
    
    var newImageId;
	var trimmedLineage = lineage.substring(0,255);  //trim as needed
	var name = (uniqueName.substring(0,8) + '-' + trimmedLineage).substring(0, 128)
		.replace(/\\/g, '/')
		.replace(/\./g, '_')
		.replace(/,/g,'/');    
	
    console.log('About to create image from ' + instanceId + ' with name "' + name + '"');
    
    client.call("CreateImage", {
        InstanceId: instanceId,
        Description: trimmedLineage,
        Name: name
    }, function(response) {
        newImageId = response.imageId;
		console.log('requested AMI, id will be ' + newImageId + '...waiting...');
    });

    //need to make sure the image is ready before we exit
    client.poll("DescribeImages", {
        "Filter.1.Name": "state", 
        "Filter.1.Value.1": "available",
        "Filter.2.Name": "name",
        "Filter.2.Value.1": name
    }, function(response) {
        var imageSet = response.imagesSet;
        if (imageSet.length == 0) {
			return false;
		} else {
			//tag the new image...
			client.call("CreateTags", {
				"ResourceId.1": newImageId,
				"Tag.1.Key": "lineage",
				"Tag.1.Value": trimmedLineage,
				"Tag.2.Key": "uniqueName",
				"Tag.2.Value": uniqueName,
				"Tag.3.Key": "generator",
				"Tag.3.Value": "https://github.com/perfectapi/ami-generator"	
			}, function(response) {
				//tags done
				//console.log(response);
				console.log('Tagged new AMI');
			});
			
			//finally terminate the instance...
			client.call("TerminateInstances", {
				InstanceId: instanceId
			}, function(response) {
				//terminated
				console.log('terminated intance');
			});
			
			return true;
		}
    });
    
	client.on("error", function (err) {
		if (err=="Error: connect Unknown system errno 10060") {
			console.log('Encountered timeout error: ' + err + '.  Dying...');
			callback('error generating ami - ' + err);
		} else {
			callback('error generating ami - ' + err);
		}		
    });
	
    // When all of the Amazon Query API calls and polls complete, we know that our
    // Amazon EC2 instance is ready for use.
    client.on("end", function () {
       console.log("Created a new AMI with id: " + newImageId);
       callback(null, newImageId);
    });
    
    // Run the trasaction described above.
    client.execute();
};