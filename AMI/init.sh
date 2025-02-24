#!/bin/bash
set -ex

sudo apt-get update
sudo apt-get install -y unzip

sudo groupadd --system csye6225
sudo useradd --system --no-create-home --shell /usr/sbin/nologin -g csye6225 csye6225

sudo mkdir -p /opt/webapp
sudo unzip /tmp/webapp.zip -d /opt/webapp

{
    echo "DB_USER=${DB_USER}"
    echo "DB_PASSWORD=${DB_PASSWORD}"
    echo "DB_NAME=${DB_NAME}"
    echo "DB_DIALECT=${DB_DIALECT}"
    echo "DB_LOGGING=${DB_LOGGING}"
    echo "DB_PORT=${DB_PORT}"
    echo "DB_HOST=${DB_HOST}"
    echo "SERVER_PORT=${SERVER_PORT}"
} | sudo tee /opt/webapp/.env

cd /opt/webapp
sudo npm install --omit=dev

sudo chown -R csye6225:csye6225 /opt/webapp

if command -v apt-get &>/dev/null; then
    sudo apt-get remove --purge -y git && sudo apt-get autoremove -y
elif command -v yum &>/dev/null; then
    sudo yum remove -y git && sudo yum autoremove -y
elif command -v dnf &>/dev/null; then
    sudo dnf remove -y git
elif command -v zypper &>/dev/null; then
    sudo zypper remove -y git
elif command -v snap &>/dev/null; then
    sudo snap remove git
else
    echo "No supported package manager found. Skipping Git removal."
fi

if command -v git &>/dev/null; then
    echo "Git still exists, removing manually..."
    sudo rm -rf /usr/bin/git /usr/local/bin/git
fi

sudo mv /tmp/webapp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable webapp.service