var gen = require('./modules/generator/generator.js');

var config = {   
        "root": "./scripts"
    ,   "baseAMI": "ami-a562a9cc"
    ,   "scripts": ["ubuntu11.10/Node0.4.12", "ubuntu11.10/Node0.4.12/cloud9", "ubuntu11.10/NginxProxy"]
    };
    
gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});

