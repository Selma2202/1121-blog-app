'use strict'

//import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const fs = require ('fs')
const app = express ( )


app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/static"))

app.set ('view engine', 'pug')
app.set ('views', __dirname + '/views')


//DATABASE NAME NOG AANPASSEN, ENVIRONMENTAL VARIABLES
let db = new sequelize ('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

//define database structure

//define models
let User = db.define( 'user', {
	firstName: sequelize.STRING,
	email: { type: sequelize.STRING, unique: true },
	password: sequelize.STRING
} )

let Post = db.define ('post', {
	title: sequelize.STRING,
	body: sequelize.STRING,
	//??? userID: sequelize.INTEGER,
})

//define relations
User.hasMany( Post )
Post.belongsTo ( User )


//set express routes
app.get ('/ping', (req, res) => {
	res.send ('pong')
})

app.get ('/', (req, res) => {
	res.render('index')
	// als ik dit wil gebruiken, haakje achter index weghalen
	// , {
	// 	message: req.query.message,
	// 	user: req.session.user
	// });
	console.log ('\nThe home/login page is now displayed in the browser')
});

app.get ('/register', (req, res) => {
	res.render('register')
	// als ik dit wil gebruiken, haakje achter index weghalen
	// , {
	// 	message: req.query.message,
	// 	user: req.session.user
	// });
	console.log ('\nThe register page is now displayed in the browser')
});

// DIT MOET NOG IN EEN APP.GET OF APP.POST	
// 	Post.findAll( {
// 		include: [ {
// 			model: User,
// 			attributes: [ 'firstName'] }]
// 	}).then (posts => {
// 		res.send( posts )
// 	})
// })

// app.get ('/users', (req, res) => {
// 	User.findAll( {
// 		attributes: ['name'],
// 		include: [ Hat ]
// 	}).then (users => {
// 		res.send( users )
// 	})
// })

db.sync( {force: true}).then( () => {
	console.log ('Synced, yay')

	//create a demo users
	User.create( {
		firstName: 'Selma',
		email: 'selmadorrestein@gmail.com',
		passsword: 'panda123'
	}).then ( user => {
		user.createPost ( {
			title: 'This is not how it works',
			body: 'I am pretty sure this is not how it works'
		})
		user.createPost ( {
			title: 'So this would be my second post?',
			body: 'For some reason, I highly doubt it',
		})
	})
	// User.create( {
	// 	name: 'Jimmy',
	// 	email: 'jimmy@hotmail.com'
	// }).then ( user => {
	// 	user.createHat ( {
	// 		name: 'Jimmyhat',
	// 		material: 'ksahdg',
	// 		height: 2,
	// 		brim: true
	// 	})
	// 	user.createHat ( {
	// 		name: 'Jimmys cool hat',
	// 		material: 'asdgklj',
	// 		height: 2,
	// 		brim: true
	// 	})
	// })
})

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )