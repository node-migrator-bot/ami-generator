PROXY_NAME=nide
PROXY_FILE=${PROXY_NAME}_proxy.conf
PROXY_PORT=8123

# ensure nginx installed
apt-get install -y nginx

# Setup basic nginx proxy.
cat > /etc/nginx/sites-available/$PROXY_FILE <<EOF
server {
    listen       80;
    
    # proxy to $PROXY_NAME - from example at http://wiki.apache.org/couchdb/Nginx_As_a_Reverse_Proxy
    location /$PROXY_NAME {
        rewrite /$PROXY_NAME/(.*) /\$1 break;
        proxy_pass http://localhost:$PROXY_PORT;
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # there is an issue with socket.io going to the root always, so we workaround it...
    location /socket.io {
        rewrite /socket.io/(.*) /\$1 break;
        proxy_pass http://localhost:$PROXY_PORT;
        proxy_redirect off;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
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