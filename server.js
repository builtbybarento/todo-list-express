//First we import express and assign it to express. 
const express = require('express')
const app = express()
//Import mongodb client
const MongoClient = require('mongodb').MongoClient
//Set default port
const PORT = 2121
//Passwords and sensitive info for connecting to database
require('dotenv').config()

//Defined db in global scope to be set later. 
let db,
//db password referenced from .env file.
    dbConnectionStr = process.env.DB_STRING 
//db name is defined (not hidden)
    dbName = 'todo' 

//Connect to mongo client using password. unified topology? no idea but its deprecated. 
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
//Connection returns a promise on which we call .then 
    .then(client => {
//Connection successs
        console.log(`Connected to ${dbName} Database`)
//Set our db value based on the name of our database now that we're connected. We call db later to retrieve/modify info
        db = client.db(dbName)
    })
//Set up ejs    
app.set('view engine', 'ejs')
//Make public folder available for access by the browser. Media, css, js all go here.
app.use(express.static('public'))
//Set up urlencoded middleware
app.use(express.urlencoded({ extended: true }))
//Json middleware
app.use(express.json())

//Get request from url ending in '/', ie load homepage. Async function
app.get('/',async (request, response)=>{
//Array of 'todos' from database store in todoItems
    const todoItems = await db.collection('todos').find().toArray()
//Counts the number of documents with property {completed:false} ie the number of to-do items that are uncrossed
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
//Return the todoItems and itemsLeft into the ejs. These are called in ejs as items and left
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//Post request adds a document to the database on '/addTodo' url ? or form? or js event listen? 
app.post('/addTodo', (request, response) => {
//Insert one document to 'todos' collection. 2 properties: thing is the todoItem and completed is false
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
//Promise is received. If successful call .then
    .then(result => {
//Log succcess
        console.log('Todo Added')
//Refresh the page
        response.redirect('/')
    })
//If the promise fails then console.log the error. 
    .catch(error => console.error(error))
})

//Put request to modify a document in the db. url /markComplete path reference? not from url
app.put('/markComplete', (request, response) => {
//Update one item from todos. Looks for item with thing value equal to the item, pulled from html into main.js
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
//set
        $set: {
//change completed property to true
            completed: true
          }
    },{
//Something useless
        sort: {_id: -1},
//
        upsert: false
    })
//Promise resolves 
    .then(result => {
//Print success
        console.log('Marked Complete')
//Respond with json containing just the string 'marked complete'
        response.json('Marked Complete')
    })
//Catch error
    .catch(error => console.error(error))

})

//Update complete item to uncomplete. Path /markUnComplete called in event listener from main.js
app.put('/markUnComplete', (request, response) => {
//In collection todos, find thing equal to item, pulled from html by main.js
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
//Set new value
        $set: {
//Property of completed is now false
            completed: false
          }
    },{
//Not sure
        sort: {_id: -1},
//
        upsert: false
    })
//Promise is returned. If resolved then
    .then(result => {
//Print success
        console.log('Marked Complete')
//Respond with json containing string "Marked Complete". This goes to node ? 
        response.json('Marked Complete')
    })
//Catch error
    .catch(error => console.error(error))

})

//Delete path /deleteItem
app.delete('/deleteItem', (request, response) => {
//go to collection todos, delete the first item with thing property equal to text from html, pulled by main.js
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
//Promise then
    .then(result => {
//Log success
        console.log('Todo Deleted')
//Server responds with 'Todo Deleted' in json 
        response.json('Todo Deleted')
    })
//Catch error
    .catch(error => console.error(error))

})
//Server listening on port 2121 or whatever we put in .env
app.listen(process.env.PORT || PORT, ()=>{
//Log success
    console.log(`Server running on port ${PORT}`)
})


