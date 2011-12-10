ami-generator
====
Generate Amazon AMI images easily.  This repository contains a collection of scripts that initialize your image to your specification.

Installing
----
    $ npm install amigen

Usage
----
Before using, set two environment variables with your AWS keys:
  AWS_ACCESS_KEY_ID
  AWS_SECRET_ACCESS_KEY
  
This allows the script to access AWS on you behalf (to generate the images).  Once that is done, usage goes something like this:

```javascript
var gen = require('amigen');

var config = {   
        "root": "./scripts"
    ,   "baseAMI": "ami-a562a9cc"
    ,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/Node0.4.12/cloud9", "ubuntu11.10/NginxProxy", "ubuntu11.10/Node0.4.12/nide"]
    };
    
gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});

```