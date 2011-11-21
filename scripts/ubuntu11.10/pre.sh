#!/bin/bash -x
MY_USER=ubuntu		 #ec2-user

# log output 
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# ensure $HOME is set for root
mkdir /home/root
export HOME="/home/root"

#ensure apt-get packages do not prompt
export DEBIAN_FRONTEND=noninteractive	