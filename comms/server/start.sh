#!/bin/bash

if [ `whoami` != root ]; then
    echo Please run this script as root or using sudo
    exit
fi
sudo service mysql restart

./gps-server/gps-server.py &

cd web-server
npm start &
cd ..

sleep 4
echo -e '\r'