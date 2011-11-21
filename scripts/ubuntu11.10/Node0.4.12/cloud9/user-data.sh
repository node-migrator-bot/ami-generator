PROXY_NAME=cloud9
PROXY_FILE=cloud9_proxy.conf
PROXY_PORT=3000

# ensure nginx installed
apt-get install -y nginx

# Setup basic nginx proxy.
cat > /etc/nginx/sites-available/$PROXY_FILE <<EOF
server {
    listen       80;
    # proxy to $PROXY_NAME
    location /PROXY_NAME {
        proxy_pass         http://127.0.0.1:$PROXY_PORT/;
    }
}
EOF
ln -s /etc/nginx/sites-available/$PROXY_FILE /etc/nginx/sites-enabled/$PROXY_FILE
/etc/init.d/nginx restart

sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && git clone git://github.com/ajaxorg/cloud9.git"

#cloud 9 editor can be run manually on the source of your choosing, e.g.
#cd
#cloud9/bin/cloud9.js -w ~/src