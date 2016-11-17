'use strict'

const express = require ('express')
const sequelize = require('sequelize')
// const bodyParser = require('body-parser')
const bcrypt = require ('bcrypt-nodejs')
var session = require('express-session');
const router = express.Router ( ) //DO NOT USE "APP EXPRESS" BECAUSE THERE IS ONLY ONE APP

router.route( '/')
.get ( (req, res) => {
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
})
.post( (req, res) => {
	//In case "required" breaks in frontend
	if(req.body.email.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}
	if(req.body.password.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}
	//Looks up inputted email in the database and grabs the entire user
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(function (user) {
		if (user !== null) { 
			//if user exists, match inputted password with registred password in a safe way
			bcrypt.compare(req.body.password, user.password, function(err, result) {
				if (err) throw (err)
					console.log(result)
				if (result == true) {
					req.session.user = user;
					res.redirect('allposts');
				} else {
					res.redirect('/?message=' + encodeURIComponent("Invalid email or password."))
				}
			})
		} else {
			res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
			//for security purposes it will not say which is wrong, and it will not say whether the email even exists in the database (however this can be checked on the registration page, but still)
		}
	}, function (error) {
		res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
		//for credibility purposes, if something is wrong with the database or the code, it will still blame the user
	});
});




module.exports = router