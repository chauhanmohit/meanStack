'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});
};

exports.signIn = function(req, res) {
   res.render('signIn', {
       user: req.user || null
   });
};
