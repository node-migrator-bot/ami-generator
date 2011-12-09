var ec2 = require("ec2");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var instanceGen = require(path.join(__dirname, 'instanceGen.js'));
var amiGen = require(path.join(__dirname, 'amiGen.js'));

exports.getImage = function(rootPath, script, baseAMI, callback) {
    
    getUserDataHash(rootPath, script, baseAMI, function(err, name, userData64) {
        if (err) {
            callback(err);
        } else {
            // Create an instance of the AmazonEC2Client.
            var client = ec2.createClient(
                { key:      process.env["AWS_ACCESS_KEY_ID"]
                , secret:   process.env["AWS_SECRET_ACCESS_KEY"]
            });
            
            console.log('name of image should be ' + name);
            
            client.call("DescribeImages", {
                "Filter.1.Name": "name",
                "Filter.1.Value.1": name
            }, function(response) {
                var imageSet = response.imagesSet;
                if (imageSet.length > 0) {
                    console.log('found matching image ' + imageSet[0].imageId);
                    callback(null, imageSet[0].imageId);
                } else {
                    //does notexist yet
                    console.log('no matching image yet - will generate');
                    //...so lets create it...
                    instanceGen.generateInstance(userData64, baseAMI, function(err, instanceId) {
                        if (err) {
                            callback(err);
                        } else {
                            amiGen.generateAMI(instanceId, name, function(err, amiId) {
                                if (err) {
                                    callback(err, amiId);
                                } else {
                                    console.log('Created new amiId = ' + amiId);
                                    callback(null, amiId);
                                }
                            });
                        }
                    });
                 }
            });
            
            // Run the trasaction described above.
            client.execute();
        }
    });
};

getUserDataHash = function(rootPath, script, baseAMI, callback) {
    getUserData64(rootPath, script, function(err, userData64) {
        if (err) {
            callback(err, '', userData64);
        } else {
            var hash = crypto.createHash('sha1');
            hash.update(userData64);
            hash.update(baseAMI);
            var result = hash.digest('hex');
            
            callback(null, result, userData64);
        }
    });
};

getUserData64 = function(rootPath, script, callback) {
    var myPath = path.resolve(rootPath, script);
    
    console.log('path = ' + myPath);
    
    var newFile = path.join(__dirname, 'user-data.tmp');
    var ws = fs.createWriteStream(newFile);
    if (fs.statSync(myPath + '/pre.sh').isFile()) {
        var b =  fs.readFileSync(myPath + '/pre.sh');
        ws.write(b);
        ws.write("\n");
    }
    if (fs.statSync(myPath + '/user-data.sh').isFile()) {
        var b =  fs.readFileSync(myPath + '/user-data.sh');
        ws.write(b);
        ws.write("\n");
    }
    if (fs.statSync(myPath + '/post.sh').isFile()) {
        var b =  fs.readFileSync(myPath + '/post.sh');
        ws.write(b);
    }
    ws.end();
    ws.destroySoon();
    
    ws.on('close', function() {
        var userData = fs.readFileSync(newFile);
        console.log('userdata generated, length = ' + userData.length);
    
        callback(null, userData.toString('base64'));
    });
    
    ws.on('error', function(err) {
        callback(err);
    });
    

};