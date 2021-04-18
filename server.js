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
app.use(express.static('public'));// static means what ever inside this file i want to send it in the same way and not modifing it 

// Set the view engine for server-side templating

app.set('view engine', 'ejs'); // this will allow us to use the render and we set it to the ejs fils extentions(else we will have to do things manull and use sendFile )
// what happend behaind the scean res.send(ejs.render(template,data)) LIKE mustach.render there is ejs.render

// Database Setup
const pg = require('pg');
const methodOverride = require('method-override');
const DATABASE_URL = process.env.DATABASE_URL;
app.use(methodOverride('_method'));

const client = new pg.Client(process.env.DATABASE_URL);


// route
app.get('/',homePage);
app.get('/searches/new',newSearch)
app.post('/searches', serachResults);
app.post('/books', saveBookToDB)
app.get('/books/:id', BookDetails);
app.delete('/books/:id', deleteBook);
app.put('/books/:id', updateBook);




// 1.make test and render hello 
//2.make the form
function newSearch(req,res) {
  res.render('./pages/searches/new')
  
}

function homePage(req,res) {
  let SQL=`SELECT * FROM pracbook;`
  client.query(SQL).then(results=>{
    res.render('pages/index', {saved:results.rows})
    // console.log('last',results.rows);
  })
    
}
//4.make the search function (API)

function serachResults(req,res) {
  // console.log(req.body);  // to test the request befor i write any thing in the function it self


  let url=`https://www.googleapis.com/books/v1/volumes?q=`;
  if (req.body.contact='title'){ //contact is the name of radio input 
    url = `${url}+intitle:${req.body.search}` //search is the name of text input 
  }else if (req.body.contact='author'){
    url = `${url}+inauthor:${req.body.search}`
  }
  superagent.get(url).then(results=>{
    arr=[];
    results.body.items.map(element=>new Book(element.volumeInfo))
    res.render('pages/searches/show',{Results:arr})
    // console.log(results.body.items);
    
  }).catch(error => {
    res.render('pages/error', { err: error })
  });
}

  
function saveBookToDB(req,res) {
  let SQL=`INSERT INTO pracbook(author,title,image,description)VALUES ($1,$2,$3,$4)RETURNING id`
  // console.log(req.body); //test the req.body so i can select it 
  let SQLArr=[req.body.author,req.body.title,req.body.image,req.body.description];
  client.query(SQL,SQLArr).then(results=>{
    // console.log('this is ',results);  // so i can see the rows and select the id in it 
    // console.log(results.rows[0].id); // to make sure i am geting the number right 
    res.redirect(`/books/${results.rows[0].id}`);
  })
  
}

function BookDetails(req,res){
  let SQL=`SELECT * FROM pracbook WHERE id=$1;`;
  let idN=req.params.id;
  client.query(SQL,[idN]).then(results=>{
    res.render('pages/books/show',{Details:results.rows});
    console.log(Details);

  }).catch(error => {
    res.render('pages/error', { err: error })
  });
}

function deleteBook(req,res) {
  let SQL=`DELETE FROM pracbook WHERE id=$1;`
  let idN=req.params.id;
  client.query(SQL,[idN]).then(()=>{
    res.redirect('/'); // i want to return to the saved books after the delete 
  }).catch(error => {
    res.render('pages/error', { err: error })
  });
}

function updateBook(req,res) {
  let {author,title,image,description}=req.body
  let SQL=`UPDATE pracbook SET author=$1,title=$2,image=$3,description=$4 WHERE id=$5;`
  let idN=req.params.id;
  let safeValues=[ author,title,image,description,idN]
  client.query(SQL,safeValues).then(()=>{
    res.redirect(`/books/${idN}`);
  }).catch(error => {
    res.render('pages/error', { err: error })
  });
}

// 3.make constructor and push to array
let arr=[];
function Book(info) {
 this.title=info.title ? info.title : 'No title was found';
//  this.image=info.imageLinks.thumbnail;
 this.image=info.imageLinks ? info.imageLinks.thumbnail : `https://i.imgur.com/J5LVHEL.jpg`;//i shose imageLinks because in this api we dont have it in all of the results 
 this.authors=info.authors ? info.authors : 'No authors was found';
 this.description=info.description ? info.description : 'No description was found';
 arr.push(this);
}

client.on('error', err => console.error(err));

client.connect().then(() => {
  console.log('connected to database');
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
});