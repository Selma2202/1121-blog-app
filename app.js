'use strict'

// Import modules
const sequelize = require('sequelize')
const express = require ('express')
const bodyParser = require('body-parser')
const fs = require ('fs')
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

let Comment = db.define ('comment', {
	comment: sequelize.STRING,
})

//Define relations
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

//// Make Index/login page exist
app.get ('/', (req, res) => {
	var user = req.session.user;
	if (user === undefined) {
		res.render('index', {
			message: req.query.message,
			user: req.session.user
		});
		console.log ('\nThe home/login page is now displayed in the browser')
	} else {
		res.redirect('allposts')
	}

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
		// console.log(user)
		if (user !== null) {
			// console.log(user)
			console.log (req.body.password)
			console.log (user.PASSWORD)
			bcrypt.compare(req.body.password, user.password, function(err, result) {
				if (err) throw (err)
					console.log(result)
				if (result == true) {
						// console.log('doet dit het')
						req.session.user = user;
						res.redirect('allposts');
					}
				})
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
	// User.create( {
	// 	firstName: req.body.firstName,
	// 	email: req.body.email,
	// 	password: req.body.password
	// })
	// res.redirect('/?message=' + encodeURIComponent("Your account has been created. Please log in."))



	// EXTRA: TO MAKE THE EMAIL NOT-MATCH THE DATABASE, TO GET A SECURE PASSWORD.
	if(req.body.password.length <= 7) {
		res.redirect('register/?message=' + encodeURIComponent("Your password should be at least 8 characters long."));
		return;}

		var dbUser = (User.findOne({
			where: {
				email: req.body.email
			}
		}))

		if ( dbUser === undefined || dbUser === null ) {
			res.redirect('register/?message=' + encodeURIComponent("This e-mail address is taken. Please choose another or login."));
			return;
		} else {
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

		// if(req.body.email !== undefined) { //???waarom doet dit het niet als (req.body.email !== undefined)// this is checking with the form, needs to pull from database. leave out for now.
	// 	
	// } else {
	// 	User.create( {
	// 		firstName: req.body.firstName,
	// 		email: req.body.email,
	// 		password: req.body.password
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
		Post.findAll({
			include: [User, Comment]
			//include: [Comment] ook meesturen om zichtbaar te maken in pug??
		}).then(function(posts) {
			// for (var i = 0; i < posts.length; i++) {
			// 	console.log(posts[i].title + '\n' + posts[i].body)
			// }
			console.log(posts)
		res.render('allposts', {data: posts, currentUser: user, postId: posts.id}) //renders to the page showing all entries
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
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view this post."));
	} else {
		console.log('\nThe browser will now display one post.')
		Post.findAll({
			where: {id: postid},
			//include: [{model: User}], [{ model: Comment, include: [{ model: User }] }] 
			include: [
			{
				model: User
			}, {
				model: Comment, 
				include: [User]
			}] 
			//en include posts (dat zou er maar een moeten zijn)
			//moet in de comments weer de users includen
			// 	where: {userId: user.id}
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
		// postId: MOET NOG GEKOPPELD WORDEN NAV MEESTUREN VAN EEN ID
	})
	res.redirect('viewsinglepost?id=' + req.query.id)
})



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
})