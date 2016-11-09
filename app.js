'use strict'

// Import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const fs = require ('fs')
var session = require('express-session');
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
})

//Define relations
User.hasMany( Post )
Post.belongsTo ( User )


// Set express routes
//// For debugging purposes
app.get ('/ping', (req, res) => {
	res.send ('pong')
})

//// Make logout page work (without it being a page really, more a functionality)
app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

//// Make Index/login page exist
app.get ('/', (req, res) => {
	res.render('index', {
		message: req.query.message,
		user: req.session.user
	});
	console.log ('\nThe home/login page is now displayed in the browser')
});

//// Make Index/login page work
app.post('/', function (req, res) {
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
app.post('/register', function (req, res) {
	User.create( {
		firstName: req.body.firstName,
		email: req.body.email,
		passsword: req.body.password
	})
	res.redirect('/?message=' + encodeURIComponent("Your account has been created. Please log in."))



	// EXTRA: TO MAKE THE EMAIL NOT-MATCH THE DATABASE, TO GET A SECURE PASSWORD.
	// if(req.body.password.length <= 7) {
	// 	res.redirect('register/?message=' + encodeURIComponent("Your password should be at least 8 characters long."));
	// 	return;
	// }
	// if(req.body.email !== undefined) { //???waarom doet dit het niet als (req.body.email !== undefined)// this is checking with the form, needs to pull from database. leave out for now.
	// 	res.redirect('register/?message=' + encodeURIComponent("This e-mail address is taken. Please choose another or login."));
	// 	return;
	// } else {
	// 	User.create( {
	// 		firstName: req.body.firstName,
	// 		email: req.body.email,
	// 		passsword: req.body.password
	// 	})
	// 	res.redirect('/')
	// }

})


//// Make allposts page exist
app.get('/allposts', function (req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view all posts."));
	} else {
		console.log('\nThe browser will now display all posts.')
		Post.findAll().then(function(posts) {
			// for (var i = 0; i < posts.length; i++) {
			// 	console.log(posts[i].title + '\n' + posts[i].body)
			// }
		res.render('allposts', {data: posts, currentUser: user}) //renders to the page showing all entries
	})
	}
});

//// Make allposts page work
app.post('/allposts', function (req, res) {
	Post.create( {
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
	})
	res.redirect('allposts')
})

//// Make ownposts page exist
app.get('/ownposts', function (req, res) {
	var user = req.session.user;
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your own posts."));
	} else {
		console.log('\nThe browser will now display your own posts.')
		Post.findAll({
			where: {userId: user.id}
		}).then(function(posts) {
		res.render('ownposts', {data: posts, currentUser: user})
		});
	}
});

// //// Make ownposts page work
// app.post('/allposts', function (req, res) {
// 	Post.create( {
// 		title: req.body.title,
// 		body: req.body.body,
// 		userId: req.session.user.id
// 	})
// 	res.redirect('allposts')
// })


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
		password: 'panda123'
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

	User.create( {
		firstName: 'Bram',
		email: 'brammieboy@hotmail.com',
		password: 'bbrraamm'
	}).then ( user => {
		user.createPost ( {
			title: 'Coolio',
			body: 'I am in the hottest social network there is rn'
		})
		user.createPost ( {
			title: 'Hey guys',
			body: 'Hello world! :) lololol programmers joke i\'m a funny boy',
		})
	})
})

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )