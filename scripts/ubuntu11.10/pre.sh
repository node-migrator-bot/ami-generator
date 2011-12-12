#!/bin/bash -x
MY_USER=ubuntu		 #ec2-user

# log output 
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# ensure $HOME is set for root
mkdir /home/root
export HOME="/home/root"

#ensure apt-get packages do not prompt
export DEBIAN_FRONTEND=noninteractive	

#set up the basic 'readme.txt' - other scripts may add to it.
cat > /home/$MY_USER/readme.txt <<EOF

Introduction
============

This image has been created automatically by amigen, a node.js tool for creating 
Amazon EC2 AMI images.

EOF

chmod 666 /home/$MY_USER/readme.txt