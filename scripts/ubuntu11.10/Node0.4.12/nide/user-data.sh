PROXY_NAME=nide
PROXY_FILE=nide_proxy.conf
PROXY_PORT=8123

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

sudo -u $MY_USER sh -c "HOME=/home/$MY_USER && cd && npm install -g nide"

#nide editor can be run manually on the source of your choosing, e.g.

#cd ~/src
#nide init

#subsequent runs do not need the init