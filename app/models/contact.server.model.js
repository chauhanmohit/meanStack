'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Contact Schema
 */
var ContactSchema = new Schema({
	title: {
	  type: String,
	  required: 'Title can not be null'
	},
	description: {
	    type: String,
	    default: '',
	    required: 'Text area for Description required'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Contact', ContactSchema);
