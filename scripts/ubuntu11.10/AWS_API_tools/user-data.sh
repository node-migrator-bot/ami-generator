
#enable multiverse s(!!!) is a form of perl regex, the bangs are arbitrary, can be anything
perl -pi -e 's!(# )(deb.+/ \S+ multiverse)!$2!g' /etc/apt/sources.list
apt-get update

#install tools
apt-get -y install ec2-api-tools

