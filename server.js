var gen = require('./modules/generator/generator.js');

var config = {   
        "root": "./scripts"
    ,   "baseAMI": "ami-bf62a9d6"
    ,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/Node0.4.12/cloud9", "ubuntu11.10/NginxProxy", "ubuntu11.10/Node0.4.12/nide"]
    };
    
gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});

