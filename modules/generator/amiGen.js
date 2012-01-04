var ec2 = require(__dirname + "/ec2proxy.js");

exports.generateAMI = function(instanceId, uniqueName, lineage, config, callback) {

    var ec2config = {
		"AWS_ACCESS_KEY_ID": config.environment.AWS_ACCESS_KEY_ID,
		"AWS_SECRET_ACCESS_KEY": config.environment.AWS_SECRET_ACCESS_KEY,
		"endpoint": config.options.region};
	
	var newImageId;
	var nameLineage = GetNormalizedLineage(lineage, 2).substring(0,255);  //trim as needed
	var description = GetNormalizedLineage(lineage).substring(0,255);
	var name = (uniqueName.substring(0,8) + '-' + nameLineage).substring(0, 128)
		.replace(/\./g, '_')
		.replace(/,/g,'/');    
	
    console.log('About to create image from ' + instanceId + ' with name "' + name + '"');
    
    ec2.call(ec2config, "CreateImage", {
        InstanceId: instanceId,
        Description: description,
        Name: name
    }, function(err, response) {
        newImageId = response.imageId;
		console.log('requested AMI, id will be ' + newImageId + '...waiting...');

		//need to make sure the image is ready before we continue
		//ec2.waitForImageState(ec2config, newImageId, 'available', 5000, function(result) {
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
				console.log('Tagged new AMI ' + newImageId);
			});
			
			ec2.call(ec2config, "TerminateInstances", {
				InstanceId: instanceId
			}, function(err, response) {
				console.log('terminated instance ' + instanceId);
			});
			
			ec2.waitForImageState(ec2config, newImageId, 'available', 5000, function(result) {
				console.log("Created a new AMI with id: " + newImageId);
				callback(null, newImageId);
			});
		});
	});
};


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