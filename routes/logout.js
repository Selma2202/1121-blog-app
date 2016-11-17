'use strict'
///// Import stuff
// Import standardized modules
const express = require ('express')
// Import for this file
const router = express.Router ( ) 

//// Make logout page work (without it being a page really, more a functionality)
router.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

//// Export
module.exports = router