# Deployment Guide

## Outline

Kung Foods is a web application that is deployed on a Linux cloud server. We use Node.js & Express to serve the backend for the web application and a MySQL database to persist data. 

## Platform Prerequisites

- Duke Virtual Machine
- Ubuntu 16.04 Image
- MySQL Ver 14.14 Distrib 5.7.18
- NodeJS v8.9.4
- NPM v5.6
- NGINX
- Certbot
- pm2
- A Domain Name (optional)

## Step-by-Step Tutorial

1. Reserve a virtual machine from [Duke's Virtual Computing Manager] (https://vcm.duke.edu/)
 - Select the Ubuntu 16.04 Linux distro

2. (Optional) Set up domain to point to the public IP address of the virtual machine

3. Set up NGINX
 - Follow [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04) to install NGINX and to configure the basic firewall
 - Follow [this tutorial] (https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04) for setting up and configuring the NGINX server blocks required to handle port traffic and redirect to the server.js port
 - Follow [this tutorial] (https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04) to enable HTTPS with certbot and LetsEncrypt, a self-signing certificate program
4. Run `git clone https://github.com/billhanyu/meals.git` to clone Kung Foods' source code onto machine

5. Set up MySQL
 - Run `sudo apt-get install mysql-server` to install MySQL
 - Run `mysql -u root -p` to access the MySQL server
 - Run `CREATE DATABASE meals;` to create meals database
 - If the database is restored from a backup, run `mysql -u root -p meals < [backup_sql_file]` to set up database tables and skip the next two bullet points
 - Exit and run `mysql -u root -p meals < server/prod_create_database.sql` to set up database tables
 - Run `mysql -u root -p meals < server/data.sql` to populate database with initial data
 - Edit config.js file with correct parameters to access the MySQL database (especially password field)

6. Install NodeJS and NPM and install Node packages
 - Run `sudo apt-get install nodejs` to install NodeJS
 - Run `sudo apt-get install npm` to install NPM
 - Run `npm install` on the outer repo folder to install the Node packages for backend
 - Run `cd frontend` and then `npm install` to install the Node packages for frontend

7. Run source code
 - Run `npm run build` to build the frontend files
 - Run `cd ..` then `babel -d ./build ./server -s` to build the backend server (you might need to install babel-cli)
 - Run `npm i -g pm2` to install pm2
 - Run `pm2 start ./build/server.js` to start the server
