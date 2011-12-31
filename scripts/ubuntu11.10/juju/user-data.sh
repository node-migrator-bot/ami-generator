add-apt-repository -y ppa:juju/pkgs
apt-get update -y
apt-get install -y juju charm-tools

sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && mkdir oneiric && ssh-keygen -q -t dsa -f ~/.ssh/id_dsa -N \"\""

cat >> /home/$MY_USER/readme.txt <<EOF

Using Juju
==========

Juju allows you to deploy various "charms" into the Amazon cloud (or maybe another cloud).  You can find a list of charms at http://charms.kapilt.com/charms.

To start, in your home foldr, type
    $ juju

This will setup a config file named .juju/environment.yaml.   Edit this file, and add the following lines:
    access-key: your_AWS_access_key 
    secret-key: your_AWS_secret_key
	
You can edit other stuff too.  I recommend changing "sample" to your own environment name.  After saving, type:
    $ juju bootstrap

This will bootstrap your environment, creating a new EC2 machine instance.  This machine will be the master juju coordinator.  

Getting and using charms
------------------------

There is a tutorial https://juju.ubuntu.com/docs/user-tutorial.html that explains how to use juju.  However, to really work with juju, you have to make use of the real library of charms (instead of the examples in the tutorial).  The tools to do that have been setup on this machine.

To get a charm that you found in the charm broswer (http://charms.kapilt.com/charms), go to your home folder and type:

    $ cd oneiric
    $ charm get charmName
where charmName is the name of the charm.  Once you have downloaded the charm, use it as follows:

    $ cd
	$ juju deploy --repository . local:charmName
	

EOF