apt-get install -y python-software-properties
add-apt-repository -y ppa:chris-lea/node.js
apt-get update -y
apt-get install -y nodejs


cat >> /home/$MY_USER/readme.txt <<EOF

Using Node
==========

To run a node program, type 
$ node server.js
...where server.js is the name of the node program

To determine which version of node is setup, type
$ node --version


EOF
