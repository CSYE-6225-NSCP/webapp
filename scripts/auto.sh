#!/bin/bash

set -e

#source .env

sudo apt update -y

sudo apt upgrade -y

sudo DEBIAN_FRONTEND=noninteractive apt install -y mysql-server

sudo systemctl start mysql
sudo systemctl enable mysql

sudo mysql --user=root --password="$DB_PASSWORD" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF

sudo mysql --user=root --password="$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

sudo groupadd csye6225app || true

sudo useradd -s /sbin/nologin -g csye6225app csye6225user || true

sudo mkdir -p /opt/csye6225
sudo unzip -q webapp-main.zip -d /opt/csye6225/

sudo chown -R csye6225user:csye6225app /opt/csye6225
sudo find /opt/csye6225 -type d -exec chmod 750 {} \;
sudo find /opt/csye6225 -type f -exec chmod 640 {} \;

echo "SCRIPT IS DONE"