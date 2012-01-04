
var ec2=require('./../generator/ec2proxy.js');

module.exports = function listRegions(config, callback) {

	var ec2config = {
		"AWS_ACCESS_KEY_ID": config.environment.AWS_ACCESS_KEY_ID,
		"AWS_SECRET_ACCESS_KEY": config.environment.AWS_SECRET_ACCESS_KEY,
		"endpoint": config.options.region};
			
	ec2.call(ec2config, "DescribeRegions", {}, function(err, response) {
		var regions = [];
		for (var i=0;i<response.regionInfo.length;i++) {
			var region = response.regionInfo[i].regionName;
			
			regions.push(region);
		}
		
		callback(null, regions.sort());
	});
}
