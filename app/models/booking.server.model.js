'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Booking Schema
 */
var BookingSchema = new Schema({

	vendorId: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	clientId: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	bookingdate: {
		type: String,
		required: 'Booking date can not be null'
	},
	fee: {
		type: Number,
		default: '',
		required: 'fee value cannot be blank'
	},
	status: {
	    type: String,
	    enum: ['pending','approved','cancelled'],
	    default: 'pending',
	    required: 'Status cannot be blank'
	},
	eventId: {
		type: Schema.ObjectId,
		ref: 'Event'
	},
	created: {
		type: Date,
		default: Date.now
	},
	eventName: {
	    type: String,
	    default: '',
	    required: 'Event Name required'
	},
});

mongoose.model('Booking', BookingSchema);