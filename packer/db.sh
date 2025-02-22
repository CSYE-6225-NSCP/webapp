#!/bin/bash


DB_PASSWORD="chaitanya"  
DB_NAME="healthdb"        
DB_USER="root"       

sudo apt update -y
sudo apt upgrade -y
sudo apt-get install -y apt-utils
sudo apt-get install -f -y


sudo add-apt-repository universe -y
sudo apt update -y
sudo apt-get install -y mysql-common mysql-client-8.0 mysql-server-core-8.0
sudo apt-get install -y mysql-server-8.0 mysql-client

sudo systemctl start mysql
sudo systemctl enable mysql

sudo mysql_secure_installation <<EOF
n
y
y
y
y
EOF

sudo mysql --user=root <<EOF
-- Set root password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';

-- Create database
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;

-- Create user and grant privileges
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';

FLUSH PRIVILEGES;
EOF

sudo systemctl restart mysql

echo "Checking database creation:"
sudo mysql -u root -p"$DB_PASSWORD" -e "SHOW DATABASES;"