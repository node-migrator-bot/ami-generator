npm install -g coffee-script docco

apt-get install -y python-setuptools

easy_install Pygments

sudo -H -u $MY_USER sh -c " \
  cd && \
  mkdir lib && \
  cd lib && \
  git clone git://github.com/derdesign/CoreJS.git corejs && \
  cd corejs/framework && \
  npm install -d "


ln -s /home/$MY_USER/lib/corejs/framework/bin/deploy /usr/local/bin/corejs-deploy
ln -s /home/$MY_USER/lib/corejs/framework/bin/newapp /usr/local/bin/corejs-newapp

cat >> /home/$MY_USER/readme.txt <<EOF

Using CoreJs
============

CoreJS is an Open Source Web Application Framework, using the MVC Architecture written in CoffeeScript, allowing you to create Powerful Web Applications with ease, keeping your code clean & readable.

See http://core-js.org/guide#section-5 to get started.

The basic setup for CoreJS has been completed.  You can create a skeleton app using something like this
  $ corejs-deploy app
  $ tar xvzf app-server.tar.gz

This will create a new folder "app-server" with the skeleton structure.

EOF
