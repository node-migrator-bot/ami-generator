#ensure distro up-to-date
yum upgrade -y

# setup daily automatic security updates
yum install -y yum-cron
chkconfig --levels 35 yum-cron on
service yum-cron start

#set up the basic 'readme.txt' - other scripts may add to it.
cat > /home/$MY_USER/readme.txt <<EOF

Introduction
============

This image has been created automatically by amigen, a node.js tool for creating 
Amazon EC2 AMI images.  See details at https://github.com/perfectapi/ami-generator

EOF

chmod 666 /home/$MY_USER/readme.txt
