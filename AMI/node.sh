#!/bin/bash
set -ex

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g pm2