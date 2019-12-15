#!/bin/bash

#install dependencies
apt-get install npm -y
apt-get install nodejs -y
apt-get install mysql-server -y
sudo service mysql restart

cd web-server
npm install
cd ..

#add as a service