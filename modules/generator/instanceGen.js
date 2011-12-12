var ec2 = require("ec2");

exports.generateInstance = function(userData, baseAMI, callback) {
   
    // Create an instance of the AmazonEC2Client.
    var client = ec2.createClient(
        { key:      process.env["AWS_ACCESS_KEY_ID"]
        , secret:   process.env["AWS_SECRET_ACCESS_KEY"]
    });
            
    // Track the progress of the API invocation in the lexical scope.
    var instanceId, 
        reservationId,
        newImageId;
        
     // Call the "RunInstances" action to create a new EC2 instance. The Amazon Query
    // API call will return immediately, but the instance will take a while to boot.
    client.call("RunInstances", {
      ImageId: baseAMI, 
      UserData: userData,   
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
      if (reservation) {
          var instance = reservation.instancesSet.filter(function (instance) {
            return instance.instanceId == instanceId;
          })[0];
          
          return (instance.instanceState.name == "stopped");     //because the script automatically stops the instance once user-data.sh completes     
      } else {
          //happens when the original RunInstances call has not yet returned. (It returns "immediately", but still async)
          return false;
      }
    });

    // When all of the Amazon Query API calls and polls complete, we know that our
    // Amazon EC2 instance is ready for use.
    client.on("end", function () {
      console.log("Instance created with id: " + instanceId);
      callback(null, instanceId);
    });
    
    // Run the trasaction described above.
    client.execute();   

};

