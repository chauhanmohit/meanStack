'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    relationship = require("mongoose-relationship"),
    Schema = mongoose.Schema;

/**
 * Event Schema
 */
var EventSchema = new Schema({

    date: {
        type: Array,
        default: Date.now()
    },
    //client id
    userId: {
        type: String,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now
    },
});

mongoose.model('Event', EventSchema);