'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Help Schema
 */
var HelpSchema = new Schema({
	title: {
	  type: String,
	  default: 'Add Title',
	  required: 'Title can not be null'
	},
	description: {
	    type: String,
	    default: 'Add Text',
	    required: 'Description is required'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Help', HelpSchema);
