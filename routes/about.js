'use strict'

//// IMPORT STUFF
// Import standardized modules
const express = require ('express')
//for this file
const router = express.Router ( ) 

//// Make about page exist
router.get ('/about', (req, res) => {
	var user = req.session.user;
	res.render('about', {
		message: req.query.message,
		user: req.session.user
	});
	console.log ('\nThe about page is now displayed in the browser')
});

//// Export
module.exports = router