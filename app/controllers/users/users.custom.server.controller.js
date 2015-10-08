'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
    errorHandler = require('../errors.server.controller'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    config = require('../../../config/config'),
    moment = require('moment'),
    async = require('async'),
    User = mongoose.model('User'),
    Event = mongoose.model('Event'),
    Book = mongoose.model('Booking'),
    CalanderEvent = mongoose.model('CalanderEvent'),
    Guidelines = mongoose.model('Guideline'),
    Contact = mongoose.model('Contact'),
    Help = mongoose.model('Help');

/**
 *  Method to serve request generated from frontend controller
 *  for listing of all vendors
 **/

exports.getAllVendors = function(req, res) {
    var result = [];
    User.find({
        roles: 'vendor'
    }, function(err, finduser) {
        if (err) {
            return res.status(400).json({
                message: 'Error occured while finding user with desired role'
            });
        }
        if (typeof(finduser) == undefined) {
            return res.status(400).json({
                message: 'Result not found, UNDEFINED Error'
            });
        }
        if (finduser.length) {
            for (var i = 0; i < finduser.length; i++) {
                result.push({
                    'id': finduser[i]._id,
                    'displayName': finduser[i].displayName,
                    'phone': finduser[i].phone,
                    'email': finduser[i].email,
                    'category': finduser[i].category,
                    'companyName': finduser[i].companyName,
                    'totalOwned': finduser[i].totalOwned,
                    'latestBooking': finduser[i].latestBooking,
                    'role': finduser[i].roles[0]
                });
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                message: "No Result found"
            })
        }
    });
}

exports.addEvent = function(req, res) {
    
    function checkisMatched(event,body,callback){
        var matchedDates = [] ;
        for(var i=0; i < event.length; i ++){
            var length = Math.min(event[i].date.length, body.date.length);
                for(var index=0;index<length;index++){
                    if(event[i].date[index].indexOf(body.date[index]) == -1 ){
                        matchedDates.push(event[i].date[index]);
                    }
                }
        }
        console.log("the matched dates are",matchedDates);
        callback(null,matchedDates);
    }

    if (req.body) {
        
        Event.find({userId:req.body.userId},function(err, event){
            if (event.length) {
                checkisMatched(event,req.body, function(callback, matched){
                    if (matched.length > 0) {
                         return res.status(400).json({
                            'message': 'Please Choose another date, Because one of the given date is already booked'
                        });
                    }else{
                        User.find({
                            _id: req.body.userId
                        }, function(err, finduser) {
                            var id = finduser[0].id ;
                            var fee = finduser[0];
                            if (finduser.length) {
                                if (finduser[0].displayName || typeof finduser[0].displayName !== undefined) {
                                    req.body.client = finduser[0].displayName;
                                    Event.create(req.body, function(err, success) {
                                        if (err) {
                                            res.send(err);
                                        }
                                        if (success) {
                                            var result = {};
                                            result.date = success.date ;
                                            result.id = id ;
                                            result.userId = fee;
                                            res.send(result);
                                        } else {
                                            res.send();
                                        }
                                    });
                                } else {
                                    return res.status(400).json({
                                        'message': 'Requested client is undefined'
                                    });
                                }
                            } else {
                                return res.status(400).json({
                                    'message': 'No Event is added'
                                });
                            }
                        }); 
                    }
                });
            }
        });

        return false ;
    
        
    } else {
        return res.status(400).json({
            'message': 'Empty Body Request'
        });
    }
}

exports.bookEvent = function(req, res) {
    if ((req.body || req.body !== null || typeof req.body == 'object') && req.body.vendorId) {
        Book.findOne({
            "bookingdate": req.body.bookingdate
        }, function(err, bookings) {
            if (err) return res.status(400).json(err);
            if (bookings == null || !bookings || typeof bookings == undefined) {
                Book.create(req.body, function(err, success) {
                    if (err) {
                        return res.status(400).json(err);
                    }
                    if (success) {
                        //call to getTotal function with response in sum variable
                        var totaly = getTotal(success.vendorId, function(callback, sum) {
                            var total = sum;
                            if (total == undefined) {
                                return res.status(400).json({
                                    message: 'Error occured while get total balance'
                                });
                            }
                            var createCal = {
                                'eventId': success.eventId,
                                'vendorId': success.vendorId,
                                'bookingId': success._id,
                                'title': success.eventName,
                                'start': success.bookingdate,
                                'className': success.eventName,
                            }
                            var update = {
                                totalOwned: total,
                                latestBooking: success.created,
                            }
                            User.findByIdAndUpdate(success.vendorId, update, function(err, success) {
                                if (err) {
                                    console.log('Error while editing event', err);
                                } else {
                                    console.log('Event edited succesfully', success);
                                }
                            });
                            //create calander event
                            CalanderEvent.create(createCal, function(err, success) {
                                if (err) {
                                    return res.status(400).json(err);
                                }
                                if (success) {
                                    return res.status(200).json(createCal);
                                } else {
                                    return res.status(400).json({
                                        'message': 'Calander Event not added successfully'
                                    });
                                }
                            });
                        });
                    } else {
                        return res.status(400).json({
                            message: "Error occured while booking event."
                        });
                    }
                });
            } else {
                return res.status(400).json({
                    "message": "Event already book for that vendor"
                });
            }
        });

        var getTotal = function getTotal(vendorId, callback) {
            Book.aggregate([{
                    $match: {
                        vendorId: vendorId
                    }
                }, {
                    $group: {
                        _id: null,
                        count: {
                            $sum: "$fee"
                        }
                    }
                }],
                function(err, result) {
                    if (err && err != null) {
                        console.log("ERROR OCCURED WHILE AGGREATING THE RESULT", err);
                    } else {
                        var sum = result[0].count;
                        callback(null, sum);
                    }
                });
        }
    } else {
        return res.status(400).json({
            "message": "Request body is empty"
        });
    }
}

exports.getBookings = function(req, res) {
    if (req.body == undefined || req.body ==null) {
        return res.status(400).json({
            "message":"Empty body request not going to be treated"    
        });
    }
    
    if (req.body.id == undefined || req.body.id == null) {
        return res.status(400).json({
            "message":"Client id must be required"    
        });
    }
    var result = [];
    var populateQuery = [{
        path: 'vendorId'
    }, {
        path: 'clientId'
    }, {
        path: 'eventId'
    }];
    Book.find({"clientId":req.body.id}).populate(populateQuery).exec(function(err, book) {
        if (book.length) {
            for (var i = 0; i < book.length; i++) {
                if (book[i].vendorId && book[i].clientId) {
                    result.push({
                        'id': book[i].id,
                        'created': book[i].created,
                        'bookingdate': book[i].bookingdate,
                        'fee': book[i].fee,
                        'vendor': book[i].vendorId.displayName,
                        'vendorID': book[i].vendorId._id,
                        'client': book[i].clientId.displayName,
                        'category': book[i].vendorId.category,
                        'status': 'Pending'
                    });
                } else {
                    result.push({});
                }
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                "message": "No booked event available"
            });
        }
    });
};
exports.getAllBookings = function(req, res) {
    if (req.body == undefined || req.body ==null) {
        return res.status(400).json({
            "message":"Empty body request not going to be treated"    
        });
    }

    var result = [];
    var populateQuery = [{
        path: 'vendorId'
    }, {
        path: 'clientId'
    }, {
        path: 'eventId'
    }];
    Book.find().populate(populateQuery).exec(function(err, book) {
        if (book.length) {
            for (var i = 0; i < book.length; i++) {
                if (book[i].vendorId && book[i].clientId) {
                    result.push({
                        'id': book[i].id,
                        'created': book[i].created,
                        'bookingdate': book[i].bookingdate,
                        'fee': book[i].fee,
                        'vendor': book[i].vendorId.displayName,
                        'vendorID': book[i].vendorId._id,
                        'client': book[i].clientId.displayName,
                        'category': book[i].vendorId.category,
                        'status': 'Pending'
                    });
                } else {
                    result.push({});
                }
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                "message": "No booked event available"
            });
        }
    });
};

exports.getSingleBooking = function(req, res) {
    var result = [];
    var populateQuery = [{
        path: 'vendorId'
    }, {
        path: 'clientId'
    }, {
        path: 'eventId'
    }];
    Book.find({
        vendorId: req.param('id')
    }).populate(populateQuery).exec(function(err, book) {
        if (book.length) {
            for (var i = 0; i < book.length; i++) {
                if (book[i].vendorId && book[i].clientId) {
                    result.push({
                        'id': book[i].id,
                        'created': book[i].created,
                        'bookingdate': book[i].bookingdate,
                        'fee': book[i].fee,
                        'vendor': book[i].vendorId.displayName,
                        'client': book[i].clientId.displayName,
                        'category': book[i].vendorId.category,
                        'status': 'Pending'
                    });
                } else {
                    result.push({});
                }
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                "message": "No booked event available"
            });
        }
    });
};

exports.editEvent = function(req, res) {
    if (req.body) {
        User.find({
            _id: req.body.userId
        }, function(err, finduser) {
            var fee = finduser[0].fee;
            if (finduser.length) {
                if (finduser[0].displayName || typeof finduser[0].displayName !== undefined) {
                    req.body.client = finduser[0].displayName;
                    var update = {
                        date: req.body.date,
                        userId: req.body.userId
                    }
                    Event.findByIdAndUpdate(req.body.id, update, function(err, success) {
                        if (err) {
                            return res.status(400).json({
                                message: 'Result not found, UNDEFINED Error'
                            });
                        } else {
                            var result = {};
                            var userId = {};
                            userId.fee = fee;
                            result.userId = userId;
                            res.status(200).json(result);
                        }
                    });
                } else {
                    return res.status(400).json({
                        'message': 'Requested client is undefined'
                    });
                }
            } else {
                return res.status(400).json({
                    'message': 'No Event is added'
                });
            }
        });
    } else {
        return res.status(400).json({
            'message': 'Empty Body Request'
        });
    }
};


exports.getAllEvents = function(req, res) {
    if (req.body == undefined || req.body.id == null || !req.body) return res.status.json({"message":"Empty Body recieved"});
    if (req.body.id) {
        var result = [];
        Event.find({
            userId : req.body.id    
        }).populate('userId').sort({
            date: 1
        }).exec(function(err, success) {
            if (success.length) {
                for (var i = 0; i < success.length; i++) {
                    result.push({
                        'id': success[i].id,
                        'fee': success[i].fee,
                        'date': success[i].date,
                        'userId': success[i].userId
                    });
                }
                return res.status(200).json(result);
            } else {
                return res.status(204).json({
                    message: "No Result found"
                });
            }
        });
    }else{
        return res.status().json({
            "message":"Please provide the required field Id"    
        });
    }

}
exports.getEvent = function(req, res) {
    var result = [];
    Event.find({
        _id: req.param('id')
    }).populate('userId').sort({
        date: 1
    }).exec(function(err, success) {
        if (success.length) {
            for (var i = 0; i < success.length; i++) {
                result.push({
                    'id': success[i].id,
                    'fee': success[i].fee,
                    'date': success[i].date,
                    'userId': success[i].userId
                });
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                message: "No Result found"
            });
        }
    });
}

exports.getSingleEvent = function(req, res) {
    var result = [];
    Event.find({
        userId: req.param('id')
    }).populate('userId').sort({
        date: 1
    }).exec(function(err, success) {
        if (success.length) {
            for (var i = 0; i < success.length; i++) {
                result.push({
                    'id': success[i].id,
                    'fee': success[i].fee,
                    'date': success[i].date,
                    'userId': success[i].userId
                });
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                message: "No Result found"
            });
        }
    });
}

exports.getAllClients = function(req, res) {
    var result = [];
    User.find({
        roles: 'client'
    }, function(err, finduser) {
        if (err) {
            return res.status(400).json({
                message: 'Error occured while finding user with desired role'
            });
        }
        if (typeof(finduser) == undefined) {
            return res.status(400).json({
                message: 'Result not found, UNDEFINED Error'
            });
        }
        if (finduser.length) {
            for (var i = 0; i < finduser.length; i++) {
                result.push({
                    'id': finduser[i]._id,
                    'displayName': finduser[i].displayName,
                    'address': finduser[i].address,
                    'username': finduser[i].username,
                    'phone': finduser[i].phone,
                    'email': finduser[i].email,
                    'fee': finduser[i].fee,
                    'employee': finduser[i].employee
                });
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                message: "No Result found"
            })
        }
    });
}

exports.editUser = function(req, res) {
    if (req.body) {
        if (req.body.category) {
            var update = {
                displayName: req.body.displayName,
                phone: req.body.phone,
                category: req.body.category
            }
        } else {
            var update = {
                displayName: req.body.displayName,
                phone: req.body.phone,
                fee: req.body.fee,
                employee: req.body.employee
            }
        }
        User.update({
            email: req.body.email
        }, update, function(err, success) {
            if (err) {
                res.send(err);
            } else {
                res.sendStatus(200);
            }
        });
    } else {
        res.status(400).json({
            "status": false,
            "code": 204,
            "error": "Empty Body Request"
        });
    }
}

exports.deleteUser = function(req, res) {
    if (req.body && Object.keys(req.body).length > 0) {
        User.findOne({
            email: req.body.email
        }, function(e, user) {
            if (e) return handleError(e);
            User.remove({
                email: req.body.email
            }, function(er, success) {
                if (!er && success != null) {
                    if (user.roles[0] == "client") {
                        Book.find({
                            clientId: req.body.id
                        }, function(err, succ) {
                            if (!err && succ != null)
                                var vend = succ[0].vendorId;
                            var clnt = succ[0].clientId;
                            Book.remove({
                                clientId: req.body.id
                            }, function(e, s) {
                                if (!e && s != null)
                                    CalanderEvent.remove({
                                        vendorId: vend
                                    }, function(error, sv) {
                                        if (!error && sv != null)
                                            Event.remove({
                                                userId: req.body.id
                                            }, function(error) {
                                                if (error) return handleError(error);
                                            });
                                    });
                            });
                        });
                        return res.status(200).json(success);
                    } else {
                        return res.status(200).json(success);
                    }
                } else {
                    return res.status(204).json(er);
                }
            });
        });
    } else {
        return res.status(400).json({
            "error": "Empty Body Request"
        });
    }
}

exports.deleteEvent = function(req, res) {
    if (req.body && Object.keys(req.body).length > 0) {
        Event.find({"_id":req.body.id},function(err,evt){
            if (err || evt == undefined || evt == null) return res.status(400).json(err);
            if (evt.length) {
                console.log("there is a event with this id",evt,evt[0].id);
                Book.find({eventId:evt[0].id},function(err,booking){
                    if (err || booking == undefined || booking == null) return res.status(400).json(err);
                    if(booking.length){
                        return res.status(400).json({
                            "message":"This building already books so not allowed to delete"    
                        });
                    }else{
                        Event.remove({
                            _id: evt[0].id
                        }, function(err, success) {
                            if (!err) {
                                console.log("comes in success section");
                                return res.status(200).json({
                                    "message":"Event Removed successfully"    
                                });
                            } else {
                                console.log("comes in error section");
                                return res.status(200).json(err);
                            }
                        });    
                    }         
                });

            }else{
                return res.status(400).json({
                    "message":"No event found with this id"    
                });
            }
        });
        
    } else {
        return res.status(400).json({
            "status": false,
            "code": 204,
            "error": "Empty Body Request"
        });
    }
}

exports.getCalanderListingForVendor = function(req, res) {
    if (req.body.id) {
        CalanderEvent.find({
            'vendorId': req.body.id
        }).exec(function(err, success) {
            var result = [];
            if (success) {
                async.mapSeries(success, function(ss, callback) {
                    Book.findById(ss.bookingId).populate('clientId').exec(function(err, res) {
                        result.push({
                            id: res.eventId,
                            title: 'Client:' + res.clientId.displayName + '\n' + 'Address:' + res.clientId.address + '\n' + 'Cancel' + '\n',
                            start: res.bookingdate,
                            className: res.eventName
                        });
                        callback(null);
                    });
                }, function(err, results) {
                    return res.status(200).json(result);
                });

            }
        });

    } else {
        return res.status(400).json({
            'message': 'Required vendor id to fetch data.'
        });
    }
}

exports.getCalanderListing = function(req, res) {
    var result = [];
    Book.findById(req.param('id')).populate('clientId').exec(function(err, success) {
        if (success) {
            result.push({
                id: success.eventId,
                title: 'Client:' + success.clientId.displayName + '\n' + 'Address:' + success.clientId.address + '\n' + 'Cancel' + '\n',
                start: success.bookingdate,
                className: success.eventName
            });
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                message: "No Result found"
            });
        }
    });

}

exports.deleteCalanderEvent = function(req, res) {

    if (req.body && Object.keys(req.body).length > 0) {
        CalanderEvent.find({
            eventId: req.body.id,
            start: req.body.start
        }, function(err, eventName) {
            if (!err && eventName != null && Object.keys(eventName).length > 0) {
                var vendor = eventName[0].vendorId;
                var dateA = moment().add(14, 'days');
                var d1 = eventName[0].start;
                var newDate = new Date(d1).toISOString();
                var d2 = moment(dateA._d).toISOString();
                var newDate1 = new Date(d2).toISOString();
                if (moment(newDate).isAfter(newDate1) == true) {
                    CalanderEvent.remove({
                        eventId: req.body.id,
                        start: req.body.start
                    }, function(err, calendor) {
                        if (!err && calendor != null) {
                            Book.findOne({
                                eventId: req.body.id,
                                bookingdate: req.body.start
                            }, function(err, post) {
                                if (!err && post != null) {
                                    Book.remove({
                                        eventId: req.body.id,
                                        bookingdate: req.body.start
                                    }, function(err, booking) {
                                        if (!err) {
                                            var totaly = getTotal(vendor, function(callback, sum) {
                                                var total = sum;
                                                if (total == undefined) {
                                                    return res.status(400).json({
                                                        message: 'Error occured while get total balance'
                                                    });
                                                }
                                                User.findByIdAndUpdate(vendor, {
                                                        totalOwned: total,
                                                        latestBooking: post.created
                                                    },
                                                    function(err, success) {
                                                        if (!err) {
                                                            console.log('Event edited succesfully', success);
                                                        } else {
                                                            console.log('Error while editing event', err);
                                                        }
                                                    });
                                            });
                                        } else {
                                            console.log('Error while find latest one booking', err);
                                        }
                                    });
                                    return res.status(200).json(post);
                                } else {
                                    return res.status(400).json({
                                        'message': 'Booking not found.'
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return res.status(200).json({
                        'message': 'You are not allowed to Cancel booking now.'
                    });
                }
            } else {
                return res.status(400).json({
                    'message': 'CalanderEvent not found.'
                });
            }
        });
        var getTotal = function getTotal(vendorId, callback) {
            Book.aggregate([{
                    $project: {
                        fee: 1,
                        eventId: 1,
                    }
                }, {
                    $group: {
                        _id: {
                            eventId: "$eventId"
                        },
                        count: {
                            $addToSet: "$fee"
                        }
                    }
                }],
                function(err, result) {
                    if (err && err != null) {
                        console.log("ERROR OCCURED WHILE AGGREATING THE RESULT", err);
                    } else {
                        if (result.length) {
                            var add = 0;
                            for (var i = 0; i < result.length; i++) {
                                add += result[i].count;
                            }
                            callback(null, add);
                        } else {
                            console.log("first booking occurs..");
                        }
                    }
                });
        }
    } else {
        res.status(204).json({
            "message": "Empty Body Request"
        });
    }
}

/**
 *  This method is used for the vendor listing
 *  on client dashboard
 **/

exports.getAllVendorsClientDashboard = function(req, res, next) {
    var result = [];
    User.find({
        roles: 'vendor'
    }, function(err, book) {
        if (book.length) {
            for (var i = 0; i < book.length; i++) {
                if (book[i]) {
                    result.push({
                        'id': book[i]._id,
                        'vendor': book[i].displayName,
                        'phone': book[i].phone,
                        'companyName': book[i].companyName,
                        'email': book[i].email,
                        'latestBooking': book[i].latestBooking,
                        'category': book[i].category,
                        'totalOwned': book[i].totalOwned
                    });
                } else {
                    result.push({});
                }
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                "message": "No booked event available"
            });
        }
    });
};

exports.getVendorBookingList = function(req, res) {
    var result = [];
    Book.find({
        "vendorId": req.body.id
    }, function(err, book) {
        if (book && book.length > 0) {
            for (var i = 0; i < book.length; i++) {
                if (book[i]) {
                    result.push({
                        '_id': book[i].id,
                        'created': book[i].created,
                        'bookingdate': book[i].bookingdate,
                        'fee': book[i].fee
                    });
                } else {
                    result.push({});
                }
            }
            return res.status(200).json(result);
        } else {
            return res.status(204).json({
                "message": "No booked event available"
            });
        }
    });
};

exports.getGuideline = function(req, res) {
    Guidelines.find({}, function(err, guideline) {
        if (guideline && guideline.length) {
            res.status(200).json(guideline);
        } else {
            res.status(204).json({
                "message": "No result found"
            });
        }
    });
};

exports.editGuideline = function(req, res) {
    if (req.body && Object.keys(req.body).length > 0) {
        Guidelines.find({}, function(err, doc) {
            if (doc.length > 0) {
                var now = new Date();
                var obj = {
                    'title': req.body.title,
                    'description': req.body.description,
                    'created': now
                };
                Guidelines.update(doc._id, obj, function(err, guidelines) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(guidelines);
                });
            } else {
                var guidelines = new Guidelines(req.body);
                guidelines.save(function(err) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(guidelines);
                });
            }
        });
    } else {
        res.status(204).json({
            "message": "Empty Body Request"
        });
    }
};

exports.getContact = function(req, res) {
    Contact.find({}, function(err, contact) {
        if (contact && contact.length) {
            res.status(200).json(contact);
        } else {
            res.status(204).json({
                "message": "No result found"
            });
        }
    });
};

exports.editContact = function(req, res) {
    if (req.body && Object.keys(req.body).length > 0) {
        Contact.find({}, function(err, doc) {
            if (doc.length > 0) {
                var now = new Date();
                var obj = {
                    'title': req.body.title,
                    'description': req.body.description,
                    'created': now
                };
                Contact.update(doc._id, obj, function(err, contact) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(contact);
                });
            } else {
                var contact = new Contact(req.body);
                contact.save(function(err) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(contact);
                });
            }
        });
    } else {
        res.status(204).json({
            "message": "Empty Body Request"
        });
    }
};

exports.getHelp = function(req, res) {
    Help.find({}, function(err, help) {
        if (help && help.length) {
            res.status(200).json(help);
        } else {
            res.status(204).json({
                "message": "No result found"
            });
        }
    });
};

exports.editHelp = function(req, res) {
    if (req.body && Object.keys(req.body).length > 0) {
        Help.find({}, function(err, doc) {
            if (doc.length > 0) {
                var now = new Date();
                var obj = {
                    'title': req.body.title,
                    'description': req.body.description,
                    'created': now
                };
                Help.update(doc._id, obj, function(err, help) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(help);
                });
            } else {
                var help = new Help(req.body);
                help.save(function(err) {
                    if (err) {
                        res.status(200).json(err);
                    }
                    res.status(200).json(help);
                });
            }
        });
    } else {
        res.status(204).json({
            "message": "Empty Body Request"
        });
    }
};