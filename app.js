'use strict'

// Import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const bcrypt = require ('bcrypt-nodejs')
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

//routes
////require
let indexRouter = require ( __dirname + '/routes/index')

////use
app.use ( '/', indexRouter)






// Connect to database
let db = new sequelize ('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	server: 'localhost',
	dialect: 'postgres'
})

// Define database structure

//// Define models
let User = db.define( 'user', {
	firstName: sequelize.STRING,
	email: { type: sequelize.STRING, unique: true },
	password: sequelize.STRING
} )
let Post = db.define ('post', {
	title: sequelize.STRING,
	body: sequelize.STRING,
})
let Comment = db.define ('comment', {
	comment: sequelize.STRING,
})

//// Define relations
User.hasMany( Post )
User.hasMany( Comment)
Post.belongsTo ( User )
Post.hasMany( Comment)
Comment.belongsTo (User)
Comment.belongsTo (Post)


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

//// Make about page exist
app.get ('/about', (req, res) => {
	var user = req.session.user;
	res.render('about', {
		message: req.query.message,
		user: req.session.user
	});
	console.log ('\nThe about page is now displayed in the browser')
});

//// Make Index/login page exist, have it redirect to all messages in case an already logged in user lands here
// app.get ('/', (req, res) => {
// 	var user = req.session.user;
// 	if (user === undefined) {
// 		res.render('index', {
// 			message: req.query.message,
// 			user: req.session.user
// 		});
// 		console.log ('\nThe home/login page is now displayed in the browser')
// 	} else {
// 		res.redirect('allposts')
// 	}
// });

// //// Make Index/login page work
// app.post('/', function (req, res) {
// 	//In case "required" breaks in frontend
// 	if(req.body.email.length === 0) {
// 		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
// 		return;
// 	}
// 	if(req.body.password.length === 0) {
// 		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
// 		return;
// 	}
// 	//Looks up inputted email in the database and grabs the entire user
// 	User.findOne({
// 		where: {
// 			email: req.body.email
// 		}
// 	}).then(function (user) {
// 		if (user !== null) { 
// 			//if user exists, match inputted password with registred password in a safe way
// 			bcrypt.compare(req.body.password, user.password, function(err, result) {
// 				if (err) throw (err)
// 					console.log(result)
// 				if (result == true) {
// 					req.session.user = user;
// 					res.redirect('allposts');
// 				} else {
// 					res.redirect('/?message=' + encodeURIComponent("Invalid email or password."))
// 				}
// 			})
// 		} else {
// 			res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
// 			//for security purposes it will not say which is wrong, and it will not say whether the email even exists in the database (however this can be checked on the registration page, but still)
// 		}
// 	}, function (error) {
// 		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
// 		//for credibility purposes, if something is wrong with the database or the code, it will still blame the user
// 	});
// });

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
	//validation in case someone changes the frontend (password length, email/firstname input.
	if(req.body.password.length <= 7) {
		res.redirect('register?message=' + encodeURIComponent("Your password should be at least 8 characters long."));
		return;
	}
	if(req.body.email.length == 0 || req.body.firstName.length == 0 ) {
		res.redirect('register?message=' + encodeURIComponent("E-mail or firstName can not be empty."));
		return;
	}
	//validation to make sure the e-mailaddress is not already used.
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then( user => {
		console.log(user)
		//first check whether emailaddress exists, only then check whether passwords match, to prevent frustration.
		if ( user ) {
			res.redirect('register?message=' + encodeURIComponent("This e-mail address is taken. Please choose another or login."));
			return;
		} else {
			if(req.body.password !== req.body.password2) {
				res.redirect('register?message=' + encodeURIComponent("Your passwords did not match. Please try again."));
				return;
			} else {
				//only if everything is checked and validated, create an account with the password being safely hashed.
				bcrypt.hash(req.body.password, null, null, function(err, hash) {
					if (err) throw (err); 
					User.create( {
						firstName: req.body.firstName,
						email: req.body.email,
						password: hash
					})
				});
				res.redirect('/?message=' + encodeURIComponent("Your account has been created. Please log in."))
			}
		}
	})
})

//// Make allposts page exist
app.get('/allposts', function (req, res) {
	var user = req.session.user;
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view all posts."));
	} else {
		console.log('\nThe browser will now display all posts.')
		Post.findAll({
			include: [User, Comment],
			order: [['updatedAt', 'DESC']]
			//send all data of posts and the users/comments accompanying posts, in reverse order (newest on top)
		}).then(function(posts) {
			res.render('allposts', {data: posts, currentUser: user, postId: posts.id})
		})
	}
});

//// Make allposts page work
//NOG BEZIG MET DATE.NOW OM NIET ZO'N LELIJKE DATUMNOTATIE TE KRIJGEN
app.post('/allposts', function (req, res) {
	Post.create( {
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
		// updatedAt: Date.now()
	})
	// console.log(posts.updatedAt)
	res.redirect('allposts')
})

//// Make ownposts page exist
app.get('/ownposts', function (req, res) {
	var user = req.session.user;
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your own posts."));
	} else {
		console.log('\nThe browser will now display your own posts.')
		Post.findAll({
			where: {userId: user.id},
			include: [User, Comment],
			order: [['updatedAt', 'DESC']]
		}).then(function(posts) {
			console.log(posts)
			res.render('ownposts', {data: posts, currentUser: user})
		});
	}
});

//// Make ownposts page work
app.post('/ownposts', function (req, res) {
	Post.create( {
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
	})
	res.redirect('ownposts')
})

//// Make certain post page exist: use ID of a post 
app.get('/viewsinglepost', function (req, res) {
	var message = req.query.message;
	var user = req.session.user;
	var postid = req.query.id;
	console.log("CHECK THIS AWESOME POSTID: " + postid)
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view this post."));
	} else {
		console.log('\nThe browser will now display one post.')
		Post.findAll({
			where: {id: postid},
			include: 
			[{model: User}, 
			{model: Comment, 
				include: [User]
			}] 
		}).then(function(comments) {
			res.render('viewsinglepost', {data: comments, currentUser: user, message: message})
			console.log(comments)
		});
	}
});

//// Make certain post page work: use ID of a post
app.post('/viewsinglepost', function (req, res) {
	var postid = req.query.id;
	console.log(postid)
	Comment.create( {
		comment: req.body.comment,
		userId: req.session.user.id,
		postId: postid
	})
	res.redirect('viewsinglepost?id=' + req.query.id)
})

db.sync( {force: false}).then( () => {
	console.log ('Synced, yay')
})

//create a demo users
// bcrypt.hash('panda123', null, null, function(err, hash) {
// 	if (err) throw (err); 

// 	User.create( {
// 		firstName: 'Selma',
// 		email: 'selmadorrestein@gmail.com',
// 		password: hash
// 	}).then ( user => {
// 		user.createPost ( {
// 			title: 'This is not how it works',
// 			body: 'I am pretty sure this is not how it works'
// 		})
// 		// .then ( post => {
// 		// 	post.createComment ( {
// 		// 		comment: 'Oh wait maybe it does work. who knows.'
// 		// 	})
// 		// 	post.createComment ( {
// 		// 		comment: 'but now how is this connected to user IDs? who knows'
// 		// 	})
// 		// })
// 		user.createPost ( {
// 			title: 'So this would be my second post?',
// 			body: 'For some reason, I highly doubt it',
// 		})
// 	})
// })

// bcrypt.hash('koekje', null, null, function(err, hash) {
// 	if (err) throw (err); 

// 	User.create( {
// 		firstName: 'Bram',
// 		email: 'brammieboy@hotmail.com',
// 		password: hash
// 	}).then ( user => {
// 		user.createPost ( {
// 			title: 'Coolio',
// 			body: 'I am in the hottest social network there is rn'
// 		})
// 		user.createPost ( {
// 			title: 'Hey guys',
// 			body: 'Hello world! :) lololol programmers joke i\'m a funny boy',
// 		})
// 	})
// })
// })

app.listen (8000, ( ) => {
	console.log ('The server is listening on local host 8000')
} )
