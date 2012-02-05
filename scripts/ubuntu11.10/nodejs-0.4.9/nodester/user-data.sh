
apt-get install -y couchdb
apt-get install -y pwgen  
npm install -g forever@0.7.5

adduser --system --group nodester
mkdir /lib/nodester

cd /lib/nodester
git clone --recursive git://github.com/nodester/nodester.git .
npm install -d

find /lib/nodester -type f -print0 | xargs -I {} -0 chmod 0664 {}
find /lib/nodester -type d -print0 | xargs -I {} -0 chmod 0775 {}
chown -R nodester /lib/nodester
chmod +x /lib/nodester/bin/*

cat >> /home/$MY_USER/readme.txt <<EOF

Using Nodester
==========

TODO


EOF
