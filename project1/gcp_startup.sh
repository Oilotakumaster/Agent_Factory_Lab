#!/bin/bash
apt-get update
# Install LAMP stack
apt-get install -y apache2 mariadb-server php libapache2-mod-php php-mysql php-curl php-gd php-mbstring php-xml php-xmlrpc wget unzip curl sudo

# Start services
systemctl start apache2
systemctl start mariadb
systemctl enable apache2
systemctl enable mariadb

# Secure MySQL and create database
mysql -uroot -e "CREATE DATABASE wordpress;"
mysql -uroot -e "CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'WpCloud@2026!';"
mysql -uroot -e "GRANT ALL PRIVILEGES ON wordpress.* TO 'wp_user'@'localhost';"
mysql -uroot -e "FLUSH PRIVILEGES;"

# Download and setup WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Remove default apache index
rm -f /var/www/html/index.html

# Download WordPress using WP-CLI
cd /var/www/html
sudo -u www-data wp core download --locale=zh_TW --path=/var/www/html

# Create config
sudo -u www-data wp config create --dbname='wordpress' --dbuser='wp_user' --dbpass='WpCloud@2026!' --path=/var/www/html

# Install WordPress
# We don't have the public IP yet, but we can set it to the generic dynamically assigned IP using curl
PUBLIC_IP=$(curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
sudo -u www-data wp core install --url="http://$PUBLIC_IP" --title="我的專屬雲端 WordPress" --admin_user="cloudadmin" --admin_password="SuperPassword!123" --admin_email="test@aiagent.com" --path=/var/www/html

# Final permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

systemctl restart apache2
