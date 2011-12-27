#prepare for AMI image
find / -name "authorized_keys" -exec shred -f -u {} \;

# This will stop the EBS boot instance
shutdown -h now