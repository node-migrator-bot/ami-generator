NODE_VERSION=0.4.12  #0.4.12 is previous stable, 0.6.2 is current stable
NODE_FILE=node-v$NODE_VERSION

#node compile & install
cd
wget http://nodejs.org/dist/$NODE_FILE.tar.gz
tar -zxvf $NODE_FILE.tar.gz
cd $NODE_FILE
./configure
make
make install
cd
rm -rf $NODE_FILE.tar.gz $NODE_FILE


# install npm - can't really have node without npm
cd
curl http://npmjs.org/install.sh | clean=yes sh

chown -R $MY_USER /usr/local/{share/man,bin,lib/node,lib/node_modules}