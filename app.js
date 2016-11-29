'use strict'

// Import standardized modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const bcrypt = require ('bcrypt-nodejs')
const session = require('express-session');

const app = express ( )

app.use(session({
	secret: 'this is a passphrase or something so ladieda',
	resave: false,
	saveUninitialized: false //"usefull with login option"
}));

app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/static"))

app.set ('view engine', 'pug')
app.set ('views', __dirname + '/views')

//// routes and modules
// require
let database = require ( __dirname + '/modules/database')

let indexRouter = require ( __dirname + '/routes/index')
let registerRouter = require ( __dirname + '/routes/register')
let allpostsRouter = require ( __dirname + '/routes/allposts')
let ownpostsRouter = require ( __dirname + '/routes/ownposts')
let viewsinglepostRouter = require ( __dirname + '/routes/viewsinglepost')
let aboutRouter = require ( __dirname + '/routes/about')
let logoutRouter = require ( __dirname + '/routes/logout')

// use
app.use ( '/', indexRouter)
app.use ( '/', registerRouter)
app.use ( '/', allpostsRouter)
app.use ( '/', ownpostsRouter)
app.use ( '/', viewsinglepostRouter)
app.use ( '/', aboutRouter)
app.use ( '/', logoutRouter)


//// For debugging purposes
app.get ('/ping', (req, res) => {
	res.send ('pong')
})

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )
