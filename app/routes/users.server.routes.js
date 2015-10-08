'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
    // User Routes
    var users = require('../../app/controllers/users.server.controller');
    var custom = require('../../app/controllers/users/users.custom.server.controller');

    // Setting up the users profile api
    app.route('/users/me').get(users.me);
    app.route('/users').put(users.update);
    app.route('/users/accounts').delete(users.removeOAuthProvider);

    // Setting up the users password api
    app.route('/users/password').post(users.changePassword);
    app.route('/auth/forgot').post(users.forgot);
    app.route('/auth/userForgotPassword').post(users.userForgotPassword);
    app.route('/auth/reset/:token').get(users.validateResetToken);
    app.route('/auth/reset/:token').post(users.reset);

    // Setting up the users authentication api
    app.route('/auth/signup').post(users.signup);
    app.route('/auth/signin').post(users.signin);

    app.route('/auth/signout').get(users.signout);

    // Setting the facebook oauth routes
    app.route('/auth/facebook').get(passport.authenticate('facebook', {
        scope: ['email']
    }));
    app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

    // Setting the twitter oauth routes
    app.route('/auth/twitter').get(passport.authenticate('twitter'));
    app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

    // Setting the google oauth routes
    app.route('/auth/google').get(passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));
    app.route('/auth/google/callback').get(users.oauthCallback('google'));

    // Setting the linkedin oauth routes
    app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
    app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

    // Setting the github oauth routes
    app.route('/auth/github').get(passport.authenticate('github'));
    app.route('/auth/github/callback').get(users.oauthCallback('github'));

    /**
     * creating custom routes to fetch data
     * from server and provide to front controller
     **/

    // adding event
    app.route('/api/getVendorListing').get(custom.getAllVendors);
    app.route('/api/addevent').post(custom.addEvent);
    app.route('/api/getEventListing').post(custom.getAllEvents);
    app.route('/api/getSingleEvent/:id').get(custom.getSingleEvent);
    app.route('/api/getEvent/:id').get(custom.getEvent);
    app.route('/api/getClientListing').get(custom.getAllClients);
    //app.route('/api/deleteVendor').post(custom.deleteUser);
    //app.route('/api/deleteClient').post(custom.deleteUser);
    app.route('/api/deleteEvent').post(custom.deleteEvent);
    app.route('/api/editEvent').post(custom.editEvent);
    app.route('/api/deleteClient').post(custom.deleteUser);
    app.route('/api/editClient').post(custom.editUser);
    app.route('/api/deleteVendor').post(custom.deleteUser);
    app.route('/api/editVendor').post(custom.editUser);
    app.route('/api/bookEvent').post(custom.bookEvent);
    app.route('/api/getBookingList').post(custom.getBookings);
    app.route('/api/getAllBookingList').get(custom.getAllBookings);
    app.route('/api/getSingleBooking/:id').get(custom.getSingleBooking);
    app.route('/api/getCalanderListingForVendor').post(custom.getCalanderListingForVendor);
    app.route('/api/getCalanderListing/:id').get(custom.getCalanderListing);
    app.route('/api/deleteCalanderEvent').post(custom.deleteCalanderEvent);
    app.route('/api/getAllVendorsClientDashboard').get(custom.getAllVendorsClientDashboard);
    app.route('/api/getVendorBookingList').post(custom.getVendorBookingList);
    app.route('/api/getGuideline').post(custom.getGuideline);
    app.route('/api/editGuideline').post(custom.editGuideline);
    app.route('/api/getContact').post(custom.getContact);
    app.route('/api/editContact').post(custom.editContact);
    app.route('/api/getHelp').post(custom.getHelp);
    app.route('/api/editHelp').post(custom.editHelp);

    // Finish by binding the user middleware
    app.param('userId', users.userByID);
};