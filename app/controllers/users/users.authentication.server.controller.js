'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    config = require('../../../config/config'),
    nodemailer = require('nodemailer'),
    crypto = require('crypto'),
    User = mongoose.model('User');
var smtpTransport = nodemailer.createTransport(config.mailer.options);

/**
 * Signup
 */
exports.signup = function(req, res) {
    if (req.body && Object.keys(req.body).length > 1 && req.body.username && req.body.displayName && req.body.phone && req.body.password && req.body.cpassword) {
        if (req.body.password == req.body.cpassword) {
            if (req.body.email !== '') {
                // Init Variables
                var user = new User(req.body);
                var message = null;
                // Add missing user fields
                user.provider = 'local';
                User.find({
                        email: user.email
                    },
                    function(err, finduser) {
                        if (err) {
                            throw err;
                            console.log('Error occured while finding user with desired email');
                        }

                        if (typeof(finduser) == undefined) {
                            console.log('Undefined result while finding user with email');
                        }

                        if (finduser.length) {
                            return res.status(400).json({
                                message: 'Email id already exits'
                            });
                        } else {
                            // Then save the user
                            user.save(function(err) {
                                if (err) {
                                    return res.status(400).json({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    // If valid email, send thanks email using service
                                    var vendorEmail = function(body) {
                                        var mailOptions = {
                                            to: body.email,
                                            from: config.mailer.from,
                                            subject: 'Successful Registration As A Vendor',
                                            html: 'This email is to confirm you that you have done Successful Registration As A Vendor. '
                                        };
                                        smtpTransport.sendMail(mailOptions, function(err) {
                                            if (!err) {
                                                var res = ({
                                                    message: 'An Email has been sent to ' + body.email + ' with information regarding your account.'
                                                });
                                            } else {
                                                var res = ({
                                                    status: 400,
                                                    message: 'Failure sending email'
                                                });
                                            }
                                        });
                                    }
                                    vendorEmail(user);
                                    // Remove sensitive data before login
                                    user.password = undefined;
                                    user.salt = undefined;
                                    crypto.randomBytes(20, function(err, buffer) {
                                        var token = buffer.toString('hex');
                                        var response = {
                                            'id': user.id,
                                            'username': user.username,
                                            'displayName': user.displayName,
                                            'companyName': user.companyName,
                                            'email': user.email,
                                            'phone': user.phone,
                                            'roles': user.roles,
                                            'isActive': user.isActive,
                                            'isVerified': user.isVerified,
                                            'provider': 'local',
                                            'token': token
                                        }
                                        req.login(response, function(err) {
                                            if (err) {
                                                res.status(400).json(err);
                                            } else {
                                                res.status(200).json(response);
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    });
            } else {
                return res.status(400).json({
                    message: 'EmailId is required'
                });
            }

        } else {
            return res.status(400).json({
                message: 'Password & Confirm password doesnot match'
            });
        }

    } else {
        return res.status(400).json({
            message: 'All Fields are mandatory & must be valid'
        });
    }
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            crypto.randomBytes(20, function(err, buffer) {
                // Remove sensitive data before login
                user.password = undefined;
                user.salt = undefined;
                var token = buffer.toString('hex');
                var response = {
                    'id': user.id,
                    'username': user.username,
                    'displayName': user.displayName,
                    'companyName': user.companyName,
                    'email': user.email,
                    'phone': user.phone,
                    'roles': user.roles,
                    'isActive': user.isActive,
                    'isVerified': user.isVerified,
                    'provider': 'local',
                    'token': token
                }
                req.login(response, function(err) {
                    if (err) {
                        console.log('comes in error section', err);
                        res.status(400).send(err);
                    } else {
                        res.json(response);
                    }
                });
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/#!/signin');
            }
            req.login(user, function(err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }
                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function(req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };

        User.findOne(searchQuery, function(err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleContactname = providerUserProfile.contactname || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueContactname(possibleContactname, null, function(availableContactname) {
                        user = new User({
                            contactName: providerUserProfile.contactName,
                            companyName: providerUserProfile.companyName,
                            phone: providerUserProfile.phone,
                            email: providerUserProfile.email,
                            password: providerUserProfile.password
                        });
                        // And save the user
                        user.save(function(err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        var user = req.user;
        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData) user.additionalProvidersData = {};
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;
            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
            // And save the user
            user.save(function(err) {
                return done(err, user, '/#!/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function(req, res, next) {
    var user = req.user;
    var provider = req.param('provider');
    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];
            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }
        user.save(function(err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function(err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    }
};