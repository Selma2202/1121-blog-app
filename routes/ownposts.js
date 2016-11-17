'use strict'

//// IMPORT STUFF
// Import standardized modules
const express = require ('express')
//Import database
let database = require (__dirname + '/../modules/database')
//for this file
const router = express.Router ( ) 

//// Make ownposts page exist
router.get('/ownposts', function (req, res) {
	var user = req.session.user;
	//in case no session is active/no user logged in
	if (user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in to view your own posts."));
	} else {
		console.log('\nThe browser will now display your own posts.')
		database.Post.findAll({
			where: {userId: user.id},
			include: [database.User, database.Comment],
			order: [['updatedAt', 'DESC']]
		}).then(function(posts) {
			console.log(posts)
			res.render('ownposts', {data: posts, currentUser: user})
		});
	}
});

//// Make ownposts page work
router.post('/ownposts', function (req, res) {
	database.Post.create( {
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
	})
	res.redirect('ownposts')
})

//// Export
module.exports = router