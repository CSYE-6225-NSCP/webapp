# webapp : healthz API

# This is a simple api which checks the health of api instance.

**Pre-requisites**

. Install latest Node.js. Verify the versions using below commands:

        node -v
        npm -v

Techstack used for API : 
                 
                 javascript(node.js), 
                 sequelize(ORM), 
                 mysql, 
                 Postman/curl for testing

`it will return 200 http status code for succesfull operation which is GET for end point \healthz`

`http status code of 405 which the method is not allowed`

`http status code of 503 when database server is turned off`

`http status code of 400 if any payloads is given`

`http://localhost:8080/healthz`

`curl -vvvv http://localhost:8080/healthz`

`curl -vvvv -XPUT http://localhost:8080/healthz`





1. After downloading add .env file and run the command `npm install` 

2. write env file 

3. `npm start`


To start/stop mysql server : `sudo /usr/local/mysql-9.2.0-macos15-arm64/support-files/mysql.server start/stop`


**`!scripting and testing`**

* Created droplet in the digital ocean and connected with ip adress using command:
                 
                 `ssh -i /Users/chaitanyam/.ssh/do root@ip`

* created the directory of /opt/csye6225
                 sudo mkdir -p /opt/csye6225/
* Then uploaded my zip file into server using the command :
                  `scp -i ~/.ssh/do /Users/chaitanyam/Desktop/webapp-main.zip root@ipv4:/opt/csye6225/ 

* Due to the mysql size the droplet ram isn't enough so i used swap memory and installed mysql using the command:

        sudo fallocate -l 1G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile

    install mysql in ubuntu server: sudo apt install mysql-server -y`

* Then written scripts of health.sh with .env 

                            DB_NAME=
                            DB_USER=
                            DB_PASSWORD=


* then run the scripts using bash health.sh



**Testing**

* written tests using supertest, jest 
* It checks for all the scenorios of success and failure and exits the code 
* get, options, post, put, delete, params, header, database server down, patch, head, xml, json





      

