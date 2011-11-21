apt-get install -y nginx

# Setup basic nginx proxy (port 1601? randomish).
cat > /etc/nginx/sites-available/node_proxy.conf <<EOF
server {
    listen       80;
    # proxy to node
    location / {
        proxy_pass         http://127.0.0.1:1601/;
    }
}
EOF
ln -s /etc/nginx/sites-available/node_proxy.conf /etc/nginx/sites-enabled/node_proxy.conf
/etc/init.d/nginx restart