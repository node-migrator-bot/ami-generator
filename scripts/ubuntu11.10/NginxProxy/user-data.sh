#ensure OOB nginx is away, because it has issues with websockets
apt-get remove -y nginx

#install some dependencies...
apt-get install -y libpcre3 libpcre3-dev

#install nginx with websocket support
cd
export NGINX_VERSION=1.0.4
curl -O http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz
git clone https://github.com/yaoweibin/nginx_tcp_proxy_module.git
tar -xvzf nginx-$NGINX_VERSION.tar.gz
cd nginx-$NGINX_VERSION
patch -p1 < ../nginx_tcp_proxy_module/tcp.patch
./configure --add-module=../nginx_tcp_proxy_module/
make && make install

#remove pesky default config...
rm /etc/nginx/sites-available/default

#create nide proxy
PROXY_NAME=nide
PROXY_FILE=${PROXY_NAME}_proxy.conf
PROXY_PORT=8123

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

#also need to handle websockets
cat >> /etc/nginx/nginx.conf <<EOF

tcp {
    upstream websockets {
        ## node processes
        server localhost:$PROXY_PORT;

        check interval=3000 rise=2 fall=5 timeout=1000;
    }   

    server {
        listen $PROXY_PORT;
        server_name _;

        tcp_nodelay on;
        proxy_pass websockets;
    }
}
EOF

#ensure it is started...
/etc/init.d/nginx restart
