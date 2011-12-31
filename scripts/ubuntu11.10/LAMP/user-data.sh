#apache2
apt-get install -y apache2
#apparmor-mod for apache
#apt-get install -y apparmor libapache2-mod-apparmor apparmor-utils
#a2enmod apparmor
#aa-enforce /etc/apparmor.d/usr.lib.apache2.mpm-prefork.apache2
service apache2 restart

#php5
apt-get install -y php5
apt-get install -y libapache2-mod-php5
service apache2 restart

#mysql
apt-get install -y pwgen  
apt-get install -y mysql-server php5-mysql

cat >> /home/$MY_USER/readme.txt <<EOF

LAMP 
====

LAMP packages have been installed.  This includes:
* Apache2
* Mysql 5.1
* PHP 5

This set of packages prepares this machine to host a large variety of websites.  Mysql has been setup 
with a blank password.  Be sure to run 

$ ./install.sh 

...to set a new random password.


EOF