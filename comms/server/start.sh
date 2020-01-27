#!/bin/bash

if [ `whoami` != root ]; then
    echo Please run this script as root or using sudo
    exit
fi
sudo service mysql restart

cd $(dirname "$0")/gps-server
echo "Starting GPS server..."
sudo ./gps-server.py &
echo "Done."
cd ..

cd $(dirname "$0")/web-server
echo "Starting web server..."
sudo node app.js &
echo "Done."
cd ..