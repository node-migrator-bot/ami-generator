wget http://prdownloads.sourceforge.net/webadmin/webmin-1.570-1.noarch.rpm
yum install -y webmin-1.570-1.noarch.rpm
rm -rf webmin-1.570-1.noarch.rpm

webminPassword=$(mkpasswd -l 10 -d 2 -s 0)
/usr/libexec/webmin/changepass.pl /etc/webmin root ${webminPassword}

cat >> /home/$MY_USER/readme.txt <<EOF

Webmin 
======

Webmin has been installed on the default port of 10000.  To access, point browser to https://ip.address:10000/

A default password has been setup:
root
${webminPassword}

EOF