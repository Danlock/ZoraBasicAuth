Instructions for running:

Make sure MongoDB is installed and running as a service on your system.

This has only been tested on Ubuntu.

1. npm install
2. node server.js

EXAMPLES:

curl --user "dan@dan.com:50" http://harudan:3000/api/login

 curl -d "email=dan@dan.com" -d "password=50" -d "name=dan lock" http://harudan:3000/api/signup

curl --user "dan@dan.com:50" -d "oldPass=50" -d "newPass=55" http://harudan:3000/api/reset/password
