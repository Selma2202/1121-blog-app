'use strict'

//// IMPORT STUFF
// Import standardized modules
const express = require ('express')
const bcrypt = require ('bcrypt-nodejs')
//Import database
let database = require (__dirname + '/../modules/database')
//for this file
const router = express.Router ( ) 


//// Make register page exist
router.get ('/register', (req, res) => {
	res.render('register', {
		message: req.query.message,
		user: req.session.user
	});
	console.log ('\nThe register page is now displayed in the browser')
})

//// Make register page work
router.post('/register', function (req, res) {
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
	database.User.findOne({
		where: {
			email: req.body.email.toLowerCase()
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
					database.User.create( {
						firstName: req.body.firstName,
						email: req.body.email.toLowerCase(),
						password: hash
					})
				});
				res.redirect('/?message=' + encodeURIComponent("Your account has been created. Please log in."))
			}
		}
	})
})

	module.exports = router