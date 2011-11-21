#!/bin/bash -x
NODE_VERSION=0.4.12  #0.4.12 is previous stable, 0.6.2 is current stable
NODE_FILE=node-v$NODE_VERSION
MY_USER=ubuntu		 #ec2-user
REDIS_VERSION=2.4.2
EMAIL=steve@perfectapi.com

# log output 
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# ensure $HOME is set for root
mkdir /home/root
export HOME="/home/root"

#ensure apt-get does not prompt, ever
export DEBIAN_FRONTEND=noninteractive	

#ensure distro up-to-date
apt-get update
apt-get dist-upgrade -y 
apt-get install -y build-essential git-core nginx libssl-dev pkg-config multitail postfix mutt
#optional - uninstall byobu
apt-get remove -y byobu		

#node compile & install
wget http://nodejs.org/dist/$NODE_FILE.tar.gz
tar -zxvf $NODE_FILE.tar.gz
cd $NODE_FILE
./configure
make
make install
cd
rm -rf $NODE_FILE.tar.gz $NODE_FILE

#adduser \
    --system \
    --shell /bin/bash \
    --gecos 'User for running node.js projects' \
    --group \
    --disabled-password \
    --home /home/node \
    node_js

# Setup basic nginx proxy.
cat > /etc/nginx/sites-available/node_proxy.conf <<EOF
server {
    listen       80;
    # proxy to node
    location / {
        proxy_pass         http://127.0.0.1:1601/;
    }
}
EOF
ln -s /etc/nginx/sites-available/node_proxy.conf /etc/nginx/sites-enabled/node_proxy.conf
/etc/init.d/nginx restart

#adduser --system --shell /bin/bash --group --disabled-password --home /home/$MY_USER $MY_USER
usermod --home /home/$MY_USER $MY_USER

# install redis
wget http://redis.googlecode.com/files/redis-$REDIS_VERSION.tar.gz
tar xzvf redis-$REDIS_VERSION.tar.gz 
cd redis-$REDIS_VERSION
make
sudo make install

# run redis as service
cat > /etc/init/redis.conf <<EOF
  description "redis"

  start on startup
  stop on shutdown

  script
      # We found $HOME is needed. Without it, we ran into problems
      export HOME="/home/$MY_USER"

      cd /var/www/apps/boardgames/current
      exec sudo -u root sh -c "/usr/local/bin/redis-server >> /var/log/redis/redis.log 2>&1"
  end script
  respawn
EOF
mkdir -p /var/log/redis
start redis

# install npm
cd
curl http://npmjs.org/install.sh | clean=yes sh

# setup daily automatic security updates
cat > /etc/apt/apt.conf.d/10periodic <<EOF
APT::Periodic::Enable "1";
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "5";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::RandomSleep "1800";
EOF

# install npm global packages
sudo chown -R $MY_USER /usr/local/{share/man,bin,lib/node,lib/node_modules}
sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && npm install -g nide express"
#run nide server
#sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && mkdir src && cd src && screen -dmS nide nide init"
#install cloud9 server
sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && git clone git://github.com/ajaxorg/cloud9.git"
#sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && screen -dmS cloud9 node cloud9/bin/cloud9.js -w ~/src"

# Get some information about the running instance
instance_id=$(wget -qO- instance-data/latest/meta-data/instance-id)
public_ip=$(wget -qO- instance-data/latest/meta-data/public-ipv4)
public_hostname=$(wget -qO- instance-data/latest/meta-data/public-hostname)
zone=$(wget -qO- instance-data/latest/meta-data/placement/availability-zone)
region=$(expr match $zone '\(.*\).')
uptime=$(uptime)

# Send status email
cat > /tmp/mailmessage.tmp <<EOF
This email message was generated on the following EC2 instance:

  instance id: $instance_id
  region:      $region
  public ip:   $public_ip
  public dns:  $public_hostname
  uptime:      $uptime

If the instance is still running, you can monitor the output of this
job using a command like:

  ssh ubuntu@$public_ip tail -1000f /var/log/user-data.log

  ec2-describe-instances --region $region $instance_id

For more information about this demo:

  Running EC2 Instances on a Recurring Schedule with Auto Scaling
  http://alestic.com/2011/11/ec2-schedule-instance

EOF

mkdir /home/root/Mail
mutt -s "Results of AWS $region $instance_id" -a /var/log/user-data.log -- $EMAIL < /tmp/mailmessage.tmp

#remove root home folder
rm -rf $HOME

#prepare for AMI image
#find / -name "authorized_keys" -exec shred -f -u {} \;

# Give the email some time to be queued and delivered
sleep 300 # 5 minutes

# This will stop the EBS boot instance, stopping the hourly charges.
# Have Auto Scaling terminate it, stopping the storage charges.
shutdown -h now

exit 0