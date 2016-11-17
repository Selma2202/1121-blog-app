'use strict'

//Import modules
const sequelize = require('sequelize')
const express = require ('express')

//define module

const db = {}
// Connect to database
db.conn = new sequelize ('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

// Define database structure

//// Define models
db.User = db.conn.define( 'user', {
	firstName: sequelize.STRING,
	email: { type: sequelize.STRING, unique: true },
	password: sequelize.STRING
} )
db.Post = db.conn.define ('post', {
	title: sequelize.STRING,
	body: sequelize.STRING,
})
db.Comment = db.conn.define ('comment', {
	comment: sequelize.STRING,
})

//// Define relations
db.User.hasMany( db.Post )
db.User.hasMany( db.Comment)
db.Post.belongsTo ( db.User )
db.Post.hasMany( db.Comment)
db.Comment.belongsTo (db.User)
db.Comment.belongsTo (db.Post)

db.conn.sync( {force: false}).then( () => {
	console.log ('Synced, yay')
})

//export defined module
module.exports = db
