#!/bin/bash

###########################################################################

nonEmptyInput () {
	local input=
	while [[ $input = "" ]]; do
	   read -e -p "$1 " input
	done
	echo "$input"
}

silentNonEmptyInput () {
	local input=
	while [[ $input = "" ]]; do
	   read -e -s -p "$1" input
	done
	echo "$input"
}

###########################################################################

if [ `whoami` != root ]; then
	echo Please run this script as root or using sudo
	exit
fi

###########################################################################
echo ""
echo "[INSTALLING SERVER DEPENDENCIES]"
chmod +x *.py *.sh

apt-get update -y
apt-get upgrade -y
apt-get install python3 -y
apt-get install python3-pip -y
#update python dependencies
pip3 install --upgrade pip
pip3 install -r requirements.txt
pip3 install pyserial

echo "Setting root only permissions for client.ini..."
chmod 600 client.ini
echo "Done."

echo ""
echo "[USER PARAMETERS]"
echo "[data_transfer" >> client.ini
track_id=$(nonEmptyInput "Which tracking ID have you been assigned??")
echo "track_id=$track_id" >> client.ini
domain=$(nonEmptyInput "What is the domain of the GPS server?")
echo "domain=$domain" >> client.ini
local_ip=$(nonEmptyInput "What is the local_ip of the GPS server? (leave blank if the server is not hosted locally on wifi.")
echo "local_ip=$local_ip" >> client.ini
port=$(nonEmptyInput "What is the port of the GPS server?")
echo "port=$port" >> client.ini
aes_key=$(nonEmptyInput "What is your assigned AES encryption key?")
echo "aes_key=$aes_key" >> client.ini

echo ""
echo "Install complete. If there are any issues, feel free to create one at: https://github.com/BMorgan1296/nisputer/issues"