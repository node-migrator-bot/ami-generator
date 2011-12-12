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

This image has been created automatically by amigen, a node.js tool for creating 
Amazon EC2 AMI images.  See details at https://github.com/perfectapi/ami-generator

EOF

chmod 666 /home/$MY_USER/readme.txt
