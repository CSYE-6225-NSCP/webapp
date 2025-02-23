#!/bin/bash

set -e  


sudo groupadd -f csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225 || true


sudo cp /tmp/webapp.service /etc/systemd/system/


sudo mkdir -p /opt/webapp


sudo cp /tmp/webapp.zip /opt/webapp/
sudo unzip -o /opt/webapp/webapp.zip -d /opt/webapp/

sudo cp /tmp/.env /opt/webapp/.env
sudo cp /tmp/.env /opt/webapp/webapp-main/.env

sudo chown csye6225:csye6225 /opt/webapp/.env
sudo chown -R csye6225:csye6225 /opt/webapp
sudo mkdir -p /opt/webapp/logs
sudo chown -R csye6225:csye6225 /opt/webapp/logs


cd /opt/webapp/webapp-main || exit 1
sudo npm install
sudo chown -R csye6225:csye6225 /opt/webapp/webapp-main/node_modules

if ! systemctl is-active --quiet mysql; then
  if ! dpkg -l | grep -q "mysql-server"; then
    sudo apt update && sudo apt install -y mysql-server
  fi
  sudo systemctl enable mysql
  sudo systemctl start mysql
fi

sudo systemctl daemon-reload
sudo systemctl enable webapp
sudo systemctl start webapp