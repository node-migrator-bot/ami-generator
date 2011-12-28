#prepare for AMI image
find / -name "authorized_keys" -exec shred -f -u {} \;

#ensure cloud-init scripts run only once.  Once-per-instance interferes with the way we generate images
#perl -pi -e 's!(.*)(cloud-init-run-module) (once-per-instance)(.*)!$1$2 once$4!g' /etc/init.d/cloud-init-user-scripts
rm -fr /var/lib/cloud/data/user-data*
rm -fr /var/lib/cloud/data/scripts
rm -fr /var/lib/cloud/scripts/per-instance

#output some debug info
ls -al /var/lib/cloud/sem/
ls -al /var/lib/cloud/data/

# This will stop the EBS boot instance
shutdown -h now