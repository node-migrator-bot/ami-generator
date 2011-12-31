#setup wordpress database
wordpressPassword=$(pwgen -n -B 10 1)

mysql --user=root --password=$mysqlPassword -e "CREATE DATABASE wordpress; GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'localhost' IDENTIFIED BY \"${wordpressPassword}\"; FLUSH PRIVILEGES;"

# Write the wordpress config
cat > /var/www/wordpress/wp-config.php <<EOF
<?php
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', '$wordpressPassword');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8');

define('AUTH_KEY',         '$(pwgen -n 60 1)');
define('SECURE_AUTH_KEY',  '$(pwgen -n 60 1)');
define('LOGGED_IN_KEY',    '$(pwgen -n 60 1)');
define('NONCE_KEY',        '$(pwgen -n 60 1)');
define('AUTH_SALT',        '$(pwgen -n 60 1)');
define('SECURE_AUTH_SALT', '$(pwgen -n 60 1)');
define('LOGGED_IN_SALT',   '$(pwgen -n 60 1)');
define('NONCE_SALT',       '$(pwgen -n 60 1)');

define('WP_DEBUG', false);

\$table_prefix  = 'ag_';  

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
        define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

?>
EOF

# setup some good permissions
find /var/www/wordpress/ -type d -exec chmod 755 {} \;
find /var/www/wordpress/ -type f -exec chmod 644 {} \;
chmod 440 /var/www/wordpress/wp-config.php
chown www-data:www-data /var/www/wordpress/wp-config.php
# chmod 664 /var/www/wordpress/.htaccess

# Write the apache config
cat > /etc/apache2/sites-available/wordpress <<EOF
<VirtualHost *:80>
  DocumentRoot /var/www/wordpress
  Options All
  ErrorLog /var/log/apache2/wp-error.log
  TransferLog /var/log/apache2/wp-access.log
</VirtualHost>
EOF

# Configure apache mods
a2enmod rewrite
a2enmod vhost_alias
# enable wordpress site
a2ensite wordpress
# disable standard site
a2dissite default
a2dissite default-ssl

service apache2 restart
