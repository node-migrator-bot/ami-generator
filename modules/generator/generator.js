var ec2 = require("ec2");
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var instanceGen = require(path.join(__dirname, 'instanceGen.js'));
var amiGen = require(path.join(__dirname, 'amiGen.js'));

exports.getImageUsingConfig = function(config, callback) {
    /*
    example config:
    {   
        "root": "ubuntu11.10"
    ,   "baseAMI": "ami-a562a9cc"
    ,   "scripts": ["Node0.4.12", "Node0.4.12/cloud9", "NginxProxy"]
    }
    
    */
    
    if (!process.env["AWS_ACCESS_KEY_ID"]) {
        callback("AWS_ACCESS_KEY_ID environment variable is required.");
        return;
    };
    if (!process.env["AWS_SECRET_ACCESS_KEY"]) {
        callback("AWS_SECRET_ACCESS_KEY environment variable is required.");
        return;
    };    
    
    console.log('root = ' + config.root);
    console.log('baseAMI = ' + config.baseAMI);
    console.log('scripts = ' + config.scripts);
    
    var rootPath = path.resolve(config.root);
    var baseAMI = config.baseAMI;
    
    //take the list of scripts and sort and normalize them.
    var scripts = [];
    for(var i=0;i<config.scripts.length;i++) {
        var scriptParts = config.scripts[i].split('/');
        
        var currentScript = '';
        for(var j=0;j<scriptParts.length;j++) {
            var sep = (j==0) ? '': '/';
            currentScript = currentScript + sep + scriptParts[j];
            
            scripts.push(currentScript);
        }
    };
    scripts = scripts.sort();
    var scriptsWithoutDups = [];
    var lastScript = '';
    for(var i=0;i<scripts.length;i++) {
        if (scripts[i] != lastScript) {
            scriptsWithoutDups.push(scripts[i]);
            lastScript = scripts[i];
        };
    }
    
    console.log(scriptsWithoutDups);
    
    //now we have a list of scripts that can be executed in order    
    var myScript = scriptsWithoutDups.shift();
    getImage(rootPath, myScript, baseAMI, recurse = function(err, newAMI) {
        if (err) {callback(err); return;}
        
        if (scriptsWithoutDups.length > 0) {
            //go to next script
            myScript = scriptsWithoutDups.shift();
            getImage(rootPath, myScript, newAMI, recurse);  //handy recursion trick, *evil laugh*
        } else {
            callback(null, newAMI);
        }
    });
};

getImage = function(
    rootPath,     //lowest path with scripts
    script,       //partial path to the script location we want to use
    baseAMI,      //AMI to use as a basis for the new AMI image
    callback) {
    
    console.log('getting image from ' + path.join(rootPath, script) + ' using base ' + baseAMI);
    
    getUserDataHash(rootPath, script, baseAMI, function(err, name, userData64) {
        if (err) {
            callback(err);
        } else {
             var client = ec2.createClient(
                { key:      process.env["AWS_ACCESS_KEY_ID"]
                , secret:   process.env["AWS_SECRET_ACCESS_KEY"]
            });
            
            console.log('name of image should be ' + name);
            
            //see if we can find the image...
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
                    console.log('no matching image yet - will generate now...could take a while...');
                    instanceGen.generateInstance(userData64, baseAMI, function(err, instanceId) {
                        if (err) {
                            callback(err);
                        } else {
                            amiGen.generateAMI(instanceId, name, path.join(rootPath, script), function(err, amiId) {
                                if (err) {
                                    callback(err, amiId);
                                } else {
                                    //console.log('Created new amiId = ' + amiId);
                                    callback(null, amiId);
                                }
                            });
                        }
                    });
                 }
            });
			
		    client.on("error", function(err) {callback(err); return; });

            // Run the transaction described above.
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
            hash.update(userData64);   //in case the scripts change
            hash.update(baseAMI);      //in case we get a new baseAMI.  This also takes care of uniqueness for multiple scripts at same level
            hash.update(rootPath);     //part of the script name that was run
            hash.update(script);       //other part of the script name that was run
            var result = hash.digest('hex');
            
            callback(null, result, userData64);
        }
    });
};

getUserData64 = function(rootPath, script, callback) {
    getUserData(rootPath, script, function(err, userData) {
        if (err)
            callback(err)
        else
            callback(err, userData.toString('base64'));
    });
};

getAllPathsToRoot = function(rootPath, script) {
    rootPath = path.resolve(rootPath);
    var currentPath = path.resolve(rootPath, script);;

    var allPaths = [];
    while(currentPath != rootPath) {
        allPaths.push(currentPath);
        
        currentPath = path.resolve(currentPath, '..');
    }
    allPaths.push(rootPath);
    
    return allPaths;
};

getPreUserData = function(rootPath, script, callback) {
    var allPaths = getAllPathsToRoot(rootPath, script);

    var newFile = path.join(allPaths[0], 'pre.tmp');    
    var ws = fs.createWriteStream(newFile);
    while(allPaths.length > 0) {
        var currentPath = allPaths.shift();  //take from front, which is root
        
        var currentFile = path.resolve(currentPath, 'pre.sh');
        if (path.existsSync(currentFile)) {
            var b =  fs.readFileSync(currentFile);
            ws.write(b);
            ws.write("\n");
        }
    }
    ws.end();
    ws.destroySoon();
    
    ws.on('close', function() {
        var preData = fs.readFileSync(newFile);
        console.log('preData generated, length = ' + preData.length);
    
        callback(null, preData);
    });    
    
    ws.on('error', function(err) {
        callback(err);
    });
};

getPostUserData = function(rootPath, script, callback) {
    var allPaths = getAllPathsToRoot(rootPath, script);

    var newFile = path.join(allPaths[0], 'post.tmp');    
    var ws = fs.createWriteStream(newFile);
    while(allPaths.length > 0) {
        var currentPath = allPaths.pop();  //take from end, which is final path
        
        var currentFile = path.resolve(currentPath, 'post.sh');
        if (path.existsSync(currentFile)) {
            var b =  fs.readFileSync(currentFile);
            ws.write(b);
            ws.write("\n");
        }
    }
    ws.end();
    ws.destroySoon();
    
    ws.on('close', function() {
        var postData = fs.readFileSync(newFile);
        console.log('postData generated, length = ' + postData.length);
    
        callback(null, postData);
    });    
    
    ws.on('error', function(err) {
        callback(err);
    });
}

getUserData = function(rootPath, script, callback) {
    var myPath = path.resolve(rootPath, script);
    
    console.log('path = ' + myPath);
    
    var newFile = path.join(myPath, 'user-data.tmp');
    var ws = fs.createWriteStream(newFile);
    getPreUserData(rootPath, script, function(err, data) {
        if (err) { callback(err); return; }
        
        ws.write(data);
        
        var currentFile = path.resolve(myPath, 'user-data.sh');
        if (path.existsSync(currentFile)) {
            var b =  fs.readFileSync(currentFile);
            ws.write(b);
            ws.write("\n");
        }
        
        getPostUserData(rootPath, script, function(err, data) {
            if (err) { callback(err); return; }
            
            ws.write(data);
            ws.end();
            ws.destroySoon();
        });
    });
    
    ws.on('close', function() {
        var userData = fs.readFileSync(newFile);
        console.log('userdata generated, length = ' + userData.length);
    
        callback(null, userData);
    });
    
    ws.on('error', function(err) {
        callback(err);
    });
};