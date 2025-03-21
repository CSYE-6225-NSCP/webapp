#!/bin/bash
set -ex

sudo apt-get update
sudo apt-get install -y unzip

sudo groupadd --system csye6225
sudo useradd --system --no-create-home --shell /usr/sbin/nologin -g csye6225 csye6225

sudo mkdir -p /opt/webapp
sudo unzip /tmp/webapp.zip -d /opt/webapp

cd /opt/webapp
sudo npm install --omit=dev

sudo chown -R csye6225:csye6225 /opt/webapp

sudo mkdir -p /opt/webapp/logs
sudo chown -R csye6225:csye6225 /opt/webapp/logs
sudo mv /tmp/cloudwatch-config.json /opt/cloudwatch-config.json
sudo chown csye6225:csye6225 /opt/cloudwatch-config.json

sudo mv /tmp/webapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable webapp.service