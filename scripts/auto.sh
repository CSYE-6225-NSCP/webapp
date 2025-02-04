#!/bin/bash

set -e

# environment variables 
# source .env.script

# 1. Update package lists and upgrade system packages
echo "Updating package lists..."
sudo apt update -y
echo "Upgrading system packages..."
sudo apt upgrade -y

#  Install MySQL Server
echo "Installing MySQL Server..."
sudo DEBIAN_FRONTEND=noninteractive apt install -y mysql-server

#  Starting the  MySQL service
echo "Starting and enabling MySQL service..."
sudo systemctl start mysql
sudo systemctl enable mysql

echo "Configuring MySQL authentication..."
sudo mysql --user=root --password="$DB_PASSWORD" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF

#  Creating the database
echo "Creating database and user..."
sudo mysql --user=root --password="$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

#  Creating application group
echo "Creating application group..."
sudo groupadd csye6225app || true

# new user for the application
echo "Creating application user..."
sudo useradd -s /sbin/nologin -g csye6225app csye6225user || true

# unzipping the application
echo "Setting up application directory..."
sudo mkdir -p /opt/csye6225
sudo unzip -q /opt/csye6225/webapp/csye6225_webapp-main.zip -d /opt/csye6225/

# Setting permissions for the folder and artifacts
echo "Setting up permissions..."
sudo chown -R csye6225user:csye6225app /opt/csye6225
sudo find /opt/csye6225 -type d -exec chmod 750 {} \;
sudo find /opt/csye6225 -type f -exec chmod 640 {} \;

echo "Setup completed successfully!"
