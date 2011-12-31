
#mysql root password
mysqlPassword=$(pwgen -n -B 10 1)
service mysql start
sleep 5
mysql -u root -e "UPDATE mysql.user SET Password=PASSWORD('${mysqlPassword}') WHERE User='root'; FLUSH PRIVILEGES;"

