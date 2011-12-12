#install n package manager first

cd
git clone git://github.com/perfectapi/n.git
cd n
make install
cd 
rm -rf n
	
#now install node
cd
n v0.4.12

# install npm - can't really have node without npm.  
cd
curl http://npmjs.org/install.sh | clean=yes sh

#this ensures we have easy access to folders we should have access to
#chown -R $MY_USER /usr/local/{share/man,bin,lib/node,lib/node_modules}

cat >> /home/$MY_USER/readme.txt <<EOF

Using Node
==========

To run a node program, type 
$ node server.js
...where server.js is the name of the node program

To determine which version of node is setup, type
$ node --version

Using "n" version switcher for Node
===================================

Node has been installed with the version switcher "n".  In order to see which node
versions are installed, type:

$ n

To install or switch to a different version of node, use:

$ sudo n latest
or a specific version:
$ sudo n v0.6.2

See http://elegantcode.com/2011/02/09/taking-baby-steps-with-node-js-node-version-management-with-n/ 
for more details and examples.

EOF
