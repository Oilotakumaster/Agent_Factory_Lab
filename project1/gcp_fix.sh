#!/bin/bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
cd /var/www/html
sudo -u www-data wp core download --locale=zh_TW --path=/var/www/html
sudo -u www-data wp config create --dbname='wordpress' --dbuser='wp_user' --dbpass='WpCloud@2026!' --path=/var/www/html
PUBLIC_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
sudo -u www-data wp core install --url="http://$PUBLIC_IP" --title="AI 雲端 WordPress" --admin_user="cloudadmin" --admin_password="SuperPassword!123" --admin_email="test@aiagent.com" --path=/var/www/html
systemctl restart apache2
