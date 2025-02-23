#!/bin/bash

sudo groupadd -f csye6225
sudo useradd -r -s /usr/sbin/nologin -g csye6225 csye6225 || true

sudo cp /tmp/webapp.service /etc/systemd/system/

sudo mkdir -p /opt/webapp

sudo cp /tmp/webapp.zip /opt/webapp/
sudo unzip -o /opt/webapp/webapp.zip -d /opt/webapp/

sudo mkdir -p /opt/webapp/webapp-main
sudo cp /tmp/.env /opt/webapp/webapp-main/.env

sudo chown csye6225:csye6225 /opt/webapp/webapp-main/.env
sudo chown -R csye6225:csye6225 /opt/webapp
sudo mkdir -p /opt/webapp/logs
sudo chown -R csye6225:csye6225 /opt/webapp/logs

cd /opt/webapp/webapp-main || exit 1
sudo npm install
sudo chown -R csye6225:csye6225 node_modules

sudo systemctl daemon-reload
sudo systemctl enable webapp

if ! systemctl is-active --quiet mysql; then
  sudo systemctl enable mysql
  sudo systemctl start mysql
fi

sudo systemctl start webapp