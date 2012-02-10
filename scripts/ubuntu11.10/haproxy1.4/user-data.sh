
apt-get install -y haproxy

cat > /etc/default/haproxy <<EOF
# Set ENABLED to 1 if you want the init script to start haproxy.
ENABLED=1
# Add extra flags here.
#EXTRAOPTS="-de -m 16"
EOF


service haproxy start