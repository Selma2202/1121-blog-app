'use strict'

//// IMPORT STUFF
// Import standardized modules
const express = require ('express')
//Import database
let database = require (__dirname + '/../modules/database')
//for this file
const router = express.Router ( ) 

// Make certain post page exist: use ID of a post 
router.get('/viewsinglepost', function (req, res) {
	var message = req.query.message;
	var user = req.session.user;
	var postid = req.query.id;
	console.log("CHECK THIS AWESOME POSTID: " + postid)
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view this post."));
	} else {
		console.log('\nThe browser will now display one post.')
		database.Post.findAll({
			where: {id: postid},
			include: 
			[{model: database.User}, 
			{model: database.Comment, 
				include: [database.User]
			}] 
		}).then(function(comments) {
			res.render('viewsinglepost', {data: comments, currentUser: user, message: message})
			console.log(comments)
		});
	}
});

// Make certain post page work: use ID of a post
router.post('/viewsinglepost', function (req, res) {
	var postid = req.query.id;
	console.log(postid)
	database.Comment.create( {
		comment: req.body.comment,
		userId: req.session.user.id,
		postId: postid
	})
	res.redirect('viewsinglepost?id=' + req.query.id)
})

//// Export
module.exports = router