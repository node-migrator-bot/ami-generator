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



