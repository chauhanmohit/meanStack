'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Calander Schema
 */
var CalanderSchema = new Schema({

    eventId: {
        type: String,
        required: 'Event Id cannot be blank'
    },
    vendorId: {
        type: String,
        required: 'Vendor Id cannot be blank'
    },
    clientId: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    bookingId: {
        type: Schema.ObjectId,
        ref: 'Booking'
    },
    title: {
        type: String,
        required: 'Event title can not be blank'
    },
    start: {
        type: String,
        required: 'Start date must be specified'
    },
    className: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    },
});

mongoose.model('CalanderEvent', CalanderSchema);