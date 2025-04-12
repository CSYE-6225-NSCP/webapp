#!/bin/bash
set -ex

sudo apt-get update
sudo apt-get install -y unzip


curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install


sudo groupadd --system csye6225
sudo useradd --system --no-create-home --shell /usr/sbin/nologin -g csye6225 csye6225

sudo mkdir -p /opt/webapp
sudo unzip /tmp/webapp.zip -d /opt/webapp

cd /opt/webapp
sudo npm install --omit=dev

sudo chown -R csye6225:csye6225 /opt/webapp

sudo mkdir -p /opt/webapp/logs
sudo chown -R csye6225:csye6225 /opt/webapp/logs
sudo mv /tmp/cloudWatch-config.json /opt/cloudWatch-config.json
sudo chown csye6225:csye6225 /opt/cloudWatch-config.json

sudo mv /tmp/webapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable webapp.service