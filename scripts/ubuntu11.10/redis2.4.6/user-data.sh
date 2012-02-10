
# based on http://library.linode.com/databases/redis/ubuntu-10.04-lucid

cd /usr/local/
mkdir /usr/local/redis
wget http://redis.googlecode.com/files/redis-2.4.6.tar.gz
tar -zxvf /usr/local/redis-2.4.6.tar.gz
cd /usr/local/redis-2.4.6/
make

cp /usr/local/redis-2.4.6/src/redis-benchmark /usr/local/redis/
cp /usr/local/redis-2.4.6/src/redis-cli /usr/local/redis/
cp /usr/local/redis-2.4.6/src/redis-server /usr/local/redis/
cp /usr/local/redis-2.4.6/src/redis-check-aof /usr/local/redis/
cp /usr/local/redis-2.4.6/src/redis-check-dump /usr/local/redis/

useradd -c 'Redis' -u 499 -s /bin/false -r -d /var/lib/redis redis 2> /dev/null || :

cat > /usr/local/redis/redis.conf <<EOF
daemonize yes
pidfile /var/run/redis.pid
logfile /var/log/redis.log

port 6379
timeout 300

loglevel notice

## Default configuration usr/localions
databases 16

save 900 1
save 300 10
save 60 10000

rdbcompression yes
dbfilename dump.rdb

dir /usr/local/redis/
appendonly no

glueoutputbuf yes
EOF

cat > /etc/init/redis-server.conf <<EOF
description "redis server"

start on started network-services
stop on stopping network-services

exec sudo -u redis /usr/local/redis/redis-server /usr/local/redis/redis.conf

respawn

EOF