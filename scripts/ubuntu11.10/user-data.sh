#ensure distro up-to-date
apt-get update
apt-get upgrade -y 
apt-get install -y build-essential git-core libssl-dev pkg-config postfix mutt
apt-get autoclean

# setup daily automatic security updates
cat > /etc/apt/apt.conf.d/10periodic <<EOF
APT::Periodic::Enable "1";
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "5";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::RandomSleep "1800";
EOF

#set up the basic 'readme.txt' - other scripts may add to it.
cat > /home/$MY_USER/readme.txt <<EOF

Introduction
============

This image has been created automatically by amigen, a tool for creating 
Amazon EC2 AMI images.  See details at https://github.com/perfectapi/ami-generator.

If you see an install.sh script in this folder, then you should run that script to complete the install on this instance:
    $ sudo ./install.sh

Output from the install will be automagically logged to /var/log/amigen-install.log.  

Please send email to amigen@perfectapi.com with any issues/suggestions.  If you want to contribute your own scripts, 
please contribute at https://github.com/perfectapi/ami-generator

EOF

chown $MY_USER /home/$MY_USER/readme.txt

