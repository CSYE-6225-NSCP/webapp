# webapp : healthz API

# This is a simple api which checks the health of api instance.

Techstack used for API : 
                 
                 javascript(node.js), 
                 sequelize(ORM), 
                 mysql, 
                 Postman/curl for testing

`it will return 200 http status code for succesfull operation which is GET for end point \healthz`

`http status code of 405 which the method is not allowed`

`http status code of 503 when database server is turned off`

`http status code of 400 if any payloads is given`



1. After downloading add .env file and run the command `npm install` 

2. write env file 

3. `npm start`


To start/stop mysql server : `sudo /usr/local/mysql-9.2.0-macos15-arm64/support-files/mysql.server start/stop`




      

