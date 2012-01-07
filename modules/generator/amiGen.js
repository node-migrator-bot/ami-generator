var ec2 = require("./ec2proxy.js");
var logger = require('winston').loggers.get('amigen-console');
	
exports.generateAMI = function(instanceId, uniqueName, lineage, config, callback) {

  var ec2config = {
		"AWS_ACCESS_KEY_ID": config.environment.AWS_ACCESS_KEY_ID,
		"AWS_SECRET_ACCESS_KEY": config.environment.AWS_SECRET_ACCESS_KEY,
		"endpoint": config.options.region};
	
	var nameLineage = GetNormalizedLineage(lineage, 2).substring(0,255);  //trim as needed
	var description = GetNormalizedLineage(lineage).substring(0,255);
	var name = (uniqueName.substring(0,8) + '-' + nameLineage).substring(0, 128)
		.replace(/\./g, '_')
		.replace(/,/g,'/');    
	
	logger.verbose('About to create image from ' + instanceId + ' with name "' + name + '"');

	CreateImageUnlessItExists(ec2config, instanceId, description, name, uniqueName, callback);
};

function CreateImageUnlessItExists(ec2config, instanceId, description, name, uniqueName, callback) {
	ec2.call(ec2config, "DescribeImages",  {
		"Filter.1.Name": "name", 
		"Filter.1.Value.1": name}, function(err, response) {
		
		if (err) {
			//just retry
			setTimeout(function() {
				CreateImageUnlessItExists(ec2config, instanceId, description, name, uniqueName, callback);
			}, 2000);
			
			return;
		}
		
		if (!response || !(response.imagesSet) || response.imagesSet.length == 0) {
			//nothing there yet
			CreateImage(ec2config, instanceId, description, name, uniqueName, callback)
		} else {
			//something there
			var newImageId = response.imagesSet[0].imageId;
			WaitForImageAvailable(ec2config, newImageId, description, callback);			
		}
	});
}

function CreateImage(ec2config, instanceId, description, name, uniqueName, callback) {
	ec2.call(ec2config, "CreateImage", {
		InstanceId: instanceId,
		Description: description,
		Name: name
	}, function(err, response) {
    

		if (err) {
			//image probably already exists. 
			//loop back and try again, but give it a couple seconds...
			logger.verbose('Retrying createimage for ' + name + '...');
			logger.verbose(err);
			setTimeout(function() {
				CreateImageUnlessItExists(ec2config, instanceId, description, name, uniqueName, callback);
			}, 2000);
			
			return;
		}
		
		var newImageId = response.imageId;
		logger.verbose('requested AMI, id will be ' + newImageId + '...waiting...');

		//need to make sure the image is ready before we continue
		ec2.waitForImageExist(ec2config, newImageId, 2000, function(result) {
		
			ec2.call(ec2config, "CreateTags", {
				"ResourceId.1": newImageId,
				"Tag.1.Key": "lineage",
				"Tag.1.Value": description,
				"Tag.2.Key": "uniqueName",
				"Tag.2.Value": uniqueName,
				"Tag.3.Key": "generator",
				"Tag.3.Value": "https://github.com/perfectapi/ami-generator",
				"Tag.4.Key": "generatedOnOS",
				"Tag.4.Value": process.platform
			}, function(err, response) {
				if (err)
					logger.error('FAILED to tag new AMI ' + newImageId + ': ' + err)
				else
					logger.verbose('Tagged new AMI ' + newImageId);
			});
			
			ec2.call(ec2config, "TerminateInstances", {
				InstanceId: instanceId
			}, function(err, response) {
				if (err)
					logger.error('FAILED to terminate instance ' + instanceId + ': ' + err)
				else
					logger.verbose('terminated instance ' + instanceId);
			});
			
			WaitForImageAvailable(ec2config, newImageId, description, callback);
		});
	});
}

function WaitForImageAvailable(ec2config, newImageId, description, callback) {
	ec2.waitForImageState(ec2config, newImageId, 'available', 5000, function(result) {
		logger.info("Created a new AMI with id: " + newImageId);
		callback(null, newImageId);
		
		//also do some cleanup
		ec2.call(ec2config, "DescribeImages", {
			"Filter.1.Name": "tag:lineage",
			"Filter.1.Value": description
		}, function(err, response) {
		
			if (err) return logger.error(err);
			
			if (response && response.imagesSet && response.imagesSet.length>1) {
				for (var i=0;i<response.imagesSet.length;i++) {
					var imageId = response.imagesSet[i].imageId;
					
					if (imageId != newImageId){
						//delete it - it is outdated
						ec2.call(ec2config, "DeregisterImage", {
							"ImageId": imageId
						}, function(err, response) {
							
							if (err) return logger.error(err);
							
							logger.verbose('cleaned up old AMI - ' + imageId);
						});
					}
				}
			}
		});
	});
}

function GetNormalizedLineage(lineage, start) {
	start = start || 0;
	var lineageParts = lineage.replace(/\\/g, '/').split(',');
	var newLineage = "";
	var sep = "";
	for (var i=start;i<lineageParts.length;i++) {
		var thisPart = lineageParts[i];
		var thisPartSplit = thisPart.split('/');
		
		newLineage = newLineage + sep + thisPartSplit[thisPartSplit.length - 1];
		sep = ",";
	};
	
	return newLineage;
}