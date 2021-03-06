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
#install dependencies
apt-get update
apt-get install npm -y
apt-get install nodejs -y
apt install python3-mysqldb -y
apt-get install python3 -y
apt-get install python3-pip -y
#update python dependencies
pip3 install -r requirements.txt
#Install web-server dependencies
cd web-server
npm install
cd ..

cd gps-server
cd ..

###########################################################################

echo ""
echo "[MYSQL SETUP]"
dbIp="127.0.0.1"
dbPort="3306"
echo -n "" > server.ini
echo "Setting root only permissions for server.ini..."
chmod 600 server.ini
echo "Done."

echo "[mysql]" >> server.ini
echo "Do you wish to install the MySQL database locally (yes/no)"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
	#https://superuser.com/questions/56743/mysql-wont-start
	apt-get install mariadb-server mariadb-client -y
	service mysql restart
	mysql_secure_installation

	echo "MySQL IP: 127.0.0.1"
	echo "MySQL Port: 3306"
	echo "ip=127.0.0.1" >> server.ini
	echo "port=3306" >> server.ini
else
	dbIP=$(nonEmptyInput "Please enter in the IP address of the MySQL server:")
	dbPort=$(nonEmptyInput "Please enter in the port number of the MySQL server:")

	echo "ip=$dbIP" >> server.ini
	echo "port=$dbPort" >> server.ini
fi

dbun=$(nonEmptyInput "Enter the username for the MySQL server (may be root):")
echo "user=$dbun" >> server.ini
dbpw=$(silentNonEmptyInput "Enter the password for the MySQL server (which was just entered with mysql_secure_installation):")
echo "password=$dbpw" >> server.ini

echo ""
echo "[CREATING DATABASE]"
mysql --host=$dbIP --port=$dbPort mysql -u$dbun -p$dbpw < web-server/databaseCommands.sql

###########################################################################

echo ""
echo "[USER PARAMETERS]"
echo "" >> server.ini
echo "[servers]" >> server.ini
webPort=$(nonEmptyInput "Which port will the web server run on?")
echo "webPort=$webPort" >> server.ini
gpsPort=$(nonEmptyInput "Which port will the GPS server run on?")
echo "gpsPort=$gpsPort" >> server.ini
echo "** Do not forget to port forward if needed, and modify firewall accordingly! Check server.ini for reference **"

###########################################################################

echo ""
echo "[AUTORUN CONFIGURATION]"
echo "Do you wish to configure the servers to run at startup as daemons? (yes/no)"
read answer
if [ "$answer" != "${answer#[Yy]}" ] ;then
	echo "Using systemd to autostart services after reboot or crash..."
	systemctl enable mysqld.service

	nano /lib/systemd/system/nisputer-gps-server.service
	temp="[Unit]
Description=Starts nisputer tracker web and gps servers
After=multi-user.target

[Service]
ExecStart=/usr/bin/python3 $PWD/gps-server/gps-server.py

[Install]
WantedBy=multi-user.target"
	echo $temp > /lib/systemd/system/nisputer-gps-server.service
	systemctl daemon-reload
	systemctl enable nisputer-gps-server.service

	service-systemd --add --service nisputer-web-server.service --cwd $PWD/web-server --app app.js
	service nisputer-web-server.service restart
else
	echo "Servers must started manually using start.sh"
fi
echo "** It is recommended that all security steps are followed at: https://www.raspberrypi.org/documentation/configuration/security.md **"
echo "** I take no responsibility for any misconfiguration. I have designed this to run on a Raspberry Pi Zero. **"
echo ""
echo "Install complete. If there are any issues, feel free to create one at: https://github.com/BMorgan1296/nisputer/issues"

###########################################################################
