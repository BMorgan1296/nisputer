#!/bin/bash

#install dependencies
apt-get install npm -y
apt-get install nodejs -y
apt-get install mysql-server -y
apt install python3-mysqldb -y
sudo service mysql restart

cd web-server
npm install
cd ..

#Run databaseCommands.txt stuff in mysql

#add as a service
#or run sudo npm start etc.

cd gps-server
touch trackers.txt
cd ..
