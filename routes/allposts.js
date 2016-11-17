'use strict'

//// IMPORT STUFF
// Import standardized modules
const express = require ('express')
//Import database
let database = require (__dirname + '/../modules/database')
//for this file
const router = express.Router ( ) 


router.route('/allposts')
// Make allposts page exist
.get( (req, res) => {
	var user = req.session.user;
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view all posts."));
	} else {
		console.log('\nThe browser will now display all posts.')
		database.Post.findAll({
			include: [database.User, database.Comment],
			order: [['updatedAt', 'DESC']]
			//send all data of posts and the users/comments accompanying posts, in reverse order (newest on top)
		}).then(function(posts) {
			res.render('allposts', {data: posts, currentUser: user, postId: posts.id})
		})
	}
})

// Make allposts page work
//NOG BEZIG MET DATE.NOW OM NIET ZO'N LELIJKE DATUMNOTATIE TE KRIJGEN
.post( (req, res) => {
	database.Post.create( {
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
		// updatedAt: Date.now()
	})
	// console.log(posts.updatedAt)
	res.redirect('allposts')
})

//// Export
module.exports = router