#!/usr/bin/env bash

#Install node.js dependencies
npm install

#Generate a self-signed certificate
openssl req -nodes -new -x509 -keyout server.key -out server.cert

echo "Please enter your username:"
read USERNAME

while [ true ]; do

	echo "Please enter your password:"
	read -s PASSWORD1
	echo "Please confirm your password:"
	read -s PASSWORD2

	if [ "$PASSWORD1" == "$PASSWORD2" ]; then
		echo -n $USERNAME > server.usr
		echo -n $PASSWORD1 > server.pass
		echo "Your credentials have been successfully set"
		break
	else
		echo "Your passwords did not match. Please try again."
	fi
done
