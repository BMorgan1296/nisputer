#!/bin/bash

echo "Please specify 0 to install as client, and 1 for server:"
read choice


if [[ $choice -eq 1 ]]; then
	#install dependencies
	cd comms/server/
	./install-server.sh
else
	#install dependencies
	apt-get install python3 -y
	apt-get install python3-pip -y
	pip3 install pyserial

	#add as a service
fi