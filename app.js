'use strict'

// Import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const fs = require ('fs')
var session = require('express-session');
const app = express ( )

app.use(session({
	secret: 'oh wow very secret much security',
	resave: false,
	saveUninitialized: false //"usefull with login option"
}));


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
		user: req.session.user
	});
	console.log ('\nThe home/login page is now displayed in the browser')
});

//// Make Index/login page work
app.post('/', function (req, res) { //hier heb ik bodyParser.urlencoded({extended: true} weggehaald, want dit staat al bovenaan.
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
	res.render('register', {
		message: req.query.message,
		user: req.session.user
	});
	console.log ('\nThe register page is now displayed in the browser')
});

//// Make register page work
app.post('/register', function (req, res) { //hier heb ik bodyParser.urlencoded({extended: true} weggehaald, want dit staat al bovenaan.

	if(req.body.password.length <= 7) {
		res.redirect('register/?message=' + encodeURIComponent("Your password should be at least 8 characters long."));
		return;
	}
	if(req.body.email === undefined) { //???waarom doet dit het niet als (req.body.email !== undefined)
		res.redirect('register/?message=' + encodeURIComponent("This e-mail address is taken. Please choose another or login."));
		return;
	} else {
		User.create( {
			firstName: req.body.firstName,
			email: req.body.email,
			passsword: req.body.password
		})
		res.redirect('/')
	}

})


//// Make allposts page exist
app.get('/allposts', function (req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view all posts."));
	} else {
		res.render('allposts', {
			user: user
		});
	}
});

//// Make ownposts page exist
app.get('/ownposts', function (req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your own posts."));
	} else {
		res.render('ownposts', {
			user: user
		});
	}
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
		passsword: 'panda123' //???why is password not registred?
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
})

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )