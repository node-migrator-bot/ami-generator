
apt-get install -y juju

sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && ssh-keygen -q -t dsa"
