#wordpress
cd /var/www
wget http://wordpress.org/latest.tar.gz
tar -xzvf latest.tar.gz
rm latest.tar.gz

#the config part of the install is in the post.sh

cat >> /home/$MY_USER/readme.txt <<EOF

Wordpress
=========

To install Wordpress, be sure to run the install.sh script found in this folder.  Once completed, please browse to the public DNS name for your instance.

http://yourdomain.com/

There is some minimal setup work required (at that site) before Wordpress is usable.

EOF