'use strict';
require('dotenv').config();
// Application Dependencies
const express=require('express');
const superagent=require('superagent');

// Application Setup
const app=express();
const PORT=process.env.PORT||3000; // this like object and it will replace it with the one inside .env file

// Application Middleware
app.use(express.urlencoded({ extended: true }));// convert form data to an object and add it to request.body
// very important so we can get our data when we write request.body because without it the body will be empty 
// the true is something in the seting (i dont want it default)
//if we are using ajax we need app.use(express.json)
app.use(express.static('./public'));// static means what ever inside this file i want to send it in the same way and not modifing it 

// Set the view engine for server-side templating
app.set('view engine', 'ejs'); // this will allow us to use the render and we set it to the ejs fils extentions(else we will have to do things manull and use sendFile )
// what happend behaind the scean res.send(ejs.render(template,data)) LIKE mustach.render there is ejs.render

// Database Setup
const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);



app.get('/',homePage);
function homePage(req,res) {
    res.render('./pages/index')
    
}


// client.on('error', err => console.error(err));

// client.connect().then(() => {
//   console.log('connected to database');
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
// });