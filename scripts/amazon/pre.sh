#!/bin/bash -x
MY_USER=ec2-user		 #ec2-user

# log output 
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# ensure $HOME is set for root
mkdir /home/root
export HOME="/home/root"

#save some information for debug purposes
echo "The user-data script has basename `basename $0`, dirname `dirname $0`"
echo "The present working directory is `pwd`"

# helps with cache-related issues with yum
yum clean all