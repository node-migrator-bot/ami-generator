# Get some information about the running instance
instance_id=$(wget -qO- instance-data/latest/meta-data/instance-id)
public_ip=$(wget -qO- instance-data/latest/meta-data/public-ipv4)
public_hostname=$(wget -qO- instance-data/latest/meta-data/public-hostname)
zone=$(wget -qO- instance-data/latest/meta-data/placement/availability-zone)
region=$(expr match $zone '\(.*\).')
uptime=$(uptime)

#let service know we are done
curl http://test.perfectapi.com/ami/v1/completed/region/$region/instance/$instance_id

# Send status email
cat > /tmp/mailmessage.tmp <<EOF
The following instance has been generated:

  instance id: $instance_id
  region:      $region
  public ip:   $public_ip
  public dns:  $public_hostname
  uptime:      $uptime

EOF

#send email
gzip -9 -c /var/log/user-data.log > /tmp/user-data.log.gz
mkdir /home/root/Mail
mutt -s "Results of AWS $region $instance_id" -a /tmp/user-data.log.gz -- ami@perfectapi.com < /tmp/mailmessage.tmp

#prepare for AMI image
find / -name "authorized_keys" -exec shred -f -u {} \;

# Give the email some time to be queued and delivered
sleep 60 # 1 minute

# This will stop the EBS boot instance
shutdown -h now