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
let db = new sequelize (DATABASENAMEXXXXX, 'postgres', 'postgres', {
	server: 'localhost',
	dialect: 'postgres'
})

//define database structure

//define models
// let User = db.define( 'user', {
// 	name: sequelize.STRING,
// 	email: { type: sequelize.STRING, unique: true }
// } )

// let Hat = db.define ('hat', {
// 	name: sequelize.STRING,
// 	material: sequelize.STRING,
// 	height: sequelize.INTEGER,
// 	brim: sequelize.BOOLEAN
// })

//define relations
// User.hasMany( Hat )
// Hat.belongsTo ( User )


//set express routes
app.get ('/ping', (req, res) => {
	res.send ('pong')
})

// app.get ('/hats', (req, res) => {
// 	Hat.findAll( {
// 		include: [ {
// 			model: User,
// 			attributes: [ 'name'] }]
// 	}).then (hats => {
// 		res.send( hats )
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

// db.sync( {force: true}).then( () => {
// 	console.log ('Synced, yay')

// 	//create two demo users
// 	User.create( {
// 		name: 'Selma',
// 		email: 'selmadorrestein@gmail.com'
// 	}).then ( user => {
// 		user.createHat ( {
// 			name: 'Selmahat',
// 			material: 'Silk',
// 			height: 2,
// 			brim: true
// 		})
// 		user.createHat ( {
// 			name: 'selmasecondhat',
// 			material: 'lala',
// 			height: 2,
// 			brim: true
// 		})
// 	})
// 	User.create( {
// 		name: 'Jimmy',
// 		email: 'jimmy@hotmail.com'
// 	}).then ( user => {
// 		user.createHat ( {
// 			name: 'Jimmyhat',
// 			material: 'ksahdg',
// 			height: 2,
// 			brim: true
// 		})
// 		user.createHat ( {
// 			name: 'Jimmys cool hat',
// 			material: 'asdgklj',
// 			height: 2,
// 			brim: true
// 		})
// 	})

// 	//create some hats
// 	Hat.create( {
// 		name: 'Tophat',
// 		material: 'felt',
// 		height: 5,
// 		brim: true
// 	})
// 	Hat.create( {
// 		name: 'Downhat',
// 		material: 'feel',
// 		height: 1,
// 		brim: false
// 	})

// })

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )