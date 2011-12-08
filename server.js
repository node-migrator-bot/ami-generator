var ec2 = require("ec2");
var fs = require("fs");

// Create an instance of the AmazonEC2Client.
var client = ec2.createClient(
{ key:      process.env["AWS_ACCESS_KEY_ID"]
, secret:   process.env["AWS_SECRET_ACCESS_KEY"]
});

var userData;  //the user-data script

// Track the progress of the API invocation in the lexical scope.
var instanceId, 
    reservationId,
    newImageId;
    
userData = fs.readFileSync("install_node.sh");

// Call the "RunInstances" action to create a new EC2 instance. The Amazon Query
// API call will return immediately, but the instance will take a while to boot.
client.call("RunInstances", {
  ImageId: "ami-a562a9cc", 
  UserData: new Buffer(userData).toString('base64'),   
  KeyName: "stevekey",
  InstanceType: "t1.micro",
  MinCount: 1, MaxCount:1
}, function (response) {
  reservationId   = response.reservationId;
  instanceId      = response.instancesSet[0].instanceId;
});

// Therefore, we poll the  "DescribeInstances" action, calling it once every
// second until the instance state indicates that it is running.
client.poll("DescribeInstances", function (struct) {
  var reservation = struct.reservationSet.filter(function (reservation) {
    return reservation.reservationId == reservationId;
  })[0];
  var instance = reservation.instancesSet.filter(function (instance) {
    return instance.instanceId == instanceId;
  })[0];
  if (instance.instanceState.name == "stopped") {
      console.log("Instance created with id: " + instanceId);
      createAMI();
      
      return true;
  } else {
      return false;
  }
});

function createAMI() {
    client.call("CreateImage", {
        InstanceId: instanceId,
        Name: "steve test",
        Description: "just testing"
    }, function(response) {
        newImageId = response.imageId;
        //now terminate the instance...
        client.call("TerminateInstances", {
            InstanceId: instanceId
        }, function(response) {
            //all done
        });
    });
};

// When all of the Amazon Query API calls and polls complete, we know that our
// Amazon EC2 instance is ready for use.
client.on("end", function () {
  console.log("...and a new AMI with id: " + newImageId);
});

// Run the trasaction described above.
client.execute();