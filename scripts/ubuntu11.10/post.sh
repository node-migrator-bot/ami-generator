# Update readme.txt
cat >> /home/$MY_USER/readme.txt <<EOF

Final Words
===========

Thank you for your attention.  Please log bugs at:
https://github.com/perfectapi/ami-generator/issues

EOF


#prepare for AMI image
find / -name "authorized_keys" -exec shred -f -u {} \;

# This will stop the EBS boot instance
shutdown -h now