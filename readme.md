ami-generator
====
Generate Amazon AMI images easily.  This repository contains a collection of scripts that initialize your image to your specification.

The algorithm used to combine the scripts creates intermediate images which can be re-used when generating new images.   Requesting the same image again will not re-generate it, it will just return the AMI id of the existing image.  However, if one of the following changes, then an image will be re-generated:

* baseAMI image
* any of the scripts that were run for the existing image
* additional scripts are added to the configuration

Unexpected Costs
----------------
The first time this technique is used to generate images, it costs about $0.02 per script used (on your AWS account).  Subsequent generation of the same image will not do any additional work, so it is safe to re-run the process multiple times.  

Various intermediate images and snapshots may be created in your account.  You can safely delete these, but it is recommended you keep them around if you are exploring several configurations (because they are re-used).

Should the application fail for some reason, it may leave a t1.micro instance running.   These instances are easily identified by their lack of a `KeyPairName` value, and can be safely deleted.

WIP
---
This project is still a work-in-progress.  YMMV, especially on the included scripts.

Terminology
-----------
* Image - an Amazon image, identified by an AMI id, e.g. `ami-af13d9c6`
* Instance - a running machine instance created from an image.  Can be run in various sizes (combinations of CPU/memory needs), e.g. "t1.micro" (the smallest)
* "EBS" Image vs. "Instance Store" Image - This application works exclusively with "EBS" Images.

Installing
----
    $ npm install amigen

Usage
----
Before using, set two environment variables with your AWS keys:
`AWS_ACCESS_KEY_ID`
and `AWS_SECRET_ACCESS_KEY`
  
This allows the script to access AWS on you behalf (to generate the images).  Once that is done, usage goes something like this:

```javascript
var gen = require('amigen');

var config = {   
        "root": "./node_modules/amigen/scripts"
    ,   "baseAMI": "ami-a562a9cc"
    ,   "scripts": ["ubuntu11.10/AWS_API_tools", "ubuntu11.10/node-latest"]
    };
    
gen.getImageUsingConfig(config, function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});
```

Readme.txt
----------
The generated image will have a readme.txt in the default user's home folder.  This file contains notes from the script authors on how 
to make use of the included software.

It is recommended that you read this file by typing:

   $ cat readme.txt
  
(when you run an instance based off of the image).