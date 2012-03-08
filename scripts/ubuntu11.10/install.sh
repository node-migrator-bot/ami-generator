#!/bin/bash -x

#some common EC2 metadata we might need
instance_data_url=http://169.254.169.254/latest
AMI_ID=$(curl $instance_data_url/meta-data/ami-id)
HOSTNAME=$(curl $instance_data_url/meta-data/public-hostname)


