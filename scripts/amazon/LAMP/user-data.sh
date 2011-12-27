yum install -y httpd httpd-devel
yum install -y mysql mysql-server mysql-devel
yum install -y php php-mysql php-common php-gd php-mbstring php-mcrypt php-devel php-xml

chkconfig httpd on
chkconfig mysqld on

mysqlPassword=$(mkpasswd -l 10 -d 2 -s 0)
service mysqld start
sleep 5
mysql -u root -e "UPDATE mysql.user SET Password=PASSWORD('${mysqlPassword}') WHERE User='root'; FLUSH PRIVILEGES;"

cat >> /home/$MY_USER/readme.txt <<EOF

LAMP 
====

LAMP packages have been installed.  Be sure to set a root password for MySQL.

MySQL Root Password
-------------------
The default root password has been set to 
${mysqlPassword}

You can login like this:

$ mysql -u root -p
Enter Password: ${mysqlPassword}


EOF