#!/bin/bash

if [ `whoami` != root ]; then
    echo Please run this script as root or using sudo
    exit
fi
sudo service mysql restart

cd gps-server
echo "Starting GPS server..."
sudo ./gps-server.py &
echo "Done."
cd ..

cd web-server
echo "Starting web server..."
sudo node app.js &
echo "Done."
cd ..