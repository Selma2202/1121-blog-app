'use strict'

// Import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const fs = require ('fs')
const app = express ( )


app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname + "/static"))

app.set ('view engine', 'pug')
app.set ('views', __dirname + '/views')


// Connect to database
let db = new sequelize ('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

// Define database structure

// Define models
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

//Define relations
User.hasMany( Post )
Post.belongsTo ( User )


// Set express routes
//// For debugging purposes
app.get ('/ping', (req, res) => {
	res.send ('pong')
})

//// Make Index/login page exist
app.get ('/', (req, res) => {
	res.render('index', {
		message: req.query.message,
		// user: req.session.user
	});
	console.log ('\nThe home/login page is now displayed in the browser')
});

//// Make Index/login page work
app.post('/', bodyParser.urlencoded({extended: true}), function (req, res) {
	if(req.body.email.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}

	if(req.body.password.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}

	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(function (user) {
		if (user !== null && req.body.password === user.password) {
			req.session.user = user;
			res.redirect('allposts');
		} else {
			res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
			//for security purposes it will not say which is wrong, and it will not say whether the email even exists in the database
		}
	}, function (error) {
		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		//for safety value
	});
});

//// Make register page exist
app.get ('/register', (req, res) => {
	res.render('register')
	// als ik dit wil gebruiken, haakje achter index weghalen
	// , {
	// 	message: req.query.message,
	// 	user: req.session.user
	// });
	console.log ('\nThe register page is now displayed in the browser')
});

//// Make allposts page exist
// app.get('/allposts', function (req, res) {
// 	var user = req.session.user;
// 	if (user === undefined) {
// 		res.redirect('/?message=' + encodeURIComponent("Please log in to view all posts."));
// 	} else {
// 		res.render('allposts', {
// 			user: user
// 		});
// 	}
// });

//// Make ownposts page exist
// app.get('/ownposts', function (req, res) {
// 	var user = req.session.user;
// 	if (user === undefined) {
// 		res.redirect('/?message=' + encodeURIComponent("Please log in to view your own posts."));
// 	} else {
// 		res.render('ownposts', {
// 			user: user
// 		});
// 	}
// });

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