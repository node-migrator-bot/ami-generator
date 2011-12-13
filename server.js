var gen = require('./modules/generator/generator.js');

var config = {   
        "root": "./scripts"
    ,   "baseAMI": "ami-bf62a9d6"
    ,   "scripts": ["ubuntu11.10/node-latest", "ubuntu11.10/ApacheBench"]
    };
    
gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});

