#!/bin/bash

sudo groupadd csye6225
sudo useradd csye6225 --shell /usr/sbin/nologin -g csye6225

sudo cp /tmp/webapp.service /etc/systemd/system/
sudo cp /tmp/webapp.zip /opt/


sudo unzip /opt/webapp/webapp.zip -d /opt/webapp/


sudo cp /tmp/.env /opt/webapp/.env
sudo chown csye6225:csye6225 /opt/webapp/.env

sudo chown -R csye6225:csye6225 /opt/webapp
sudo mkdir -p /opt/webapp/logs
sudo chown -R csye6225:csye6225 /opt/webapp/logs

# shellcheck disable=SC2164
cd /opt/webapp/webapp-main
sudo npm install && sudo chown -R csye6225:csye6225 node_modules


sudo systemctl daemon-reload
sudo systemctl enable mysql
sudo systemctl enable webapp



sudo systemctl start mysql
sudo systemctl start webapp