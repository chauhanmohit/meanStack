'use strict';
var app = angular.module('users');

app.controller('vendorDashboardController', ['$scope', '$http', '$compile', 'uiCalendarConfig', '$modal', 'LocalStorage', '$window', '$timeout', '$filter',
    function($scope, $http, $compile, uiCalendarConfig, $modal, LocalStorage, $window, $timeout, $filter) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $scope.active = true;
        $scope.allClientListing = [] ;
        $scope.showLoader = false ;
        
        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };
        
        /**
         *  getclient listing for the vendor dashboard
         **/
        $http.get('/api/getClientListing')
        .success(function(response,status,header,config){
            $scope.allClientListing = response;
            $scope.SingleEventPage = 0;
            $scope.SingleEventPageSize = 5;
            $scope.numberOfPages=function(){
                return Math.ceil($scope.allClientListing.length/$scope.SingleEventPageSize);                
            }
        }).error(function(response,status,header,config){
            console.log("Error occured while fetching client listing");
        });
        
        $scope.proceed = function(id) {
            $scope.active = false;
            $scope.showLoader = true ;
            $scope.data = [];
            $http.post('/api/getEventListing',{"id":id}).success(function(response,status,header,config) {
                if (response) {
                    angular.forEach(response, function(value, key) {
                        if (response[key] && response[key].userId) {
                            //Array of objects to manage filteration on vendor dashboard
                            for (var i = 0; i < response[key].date.length; i++) {
                                var mydata = {};
                                mydata["id"] = response[key].id;
                                mydata["date"] = response[key].date[i];
                                mydata["clientId"] = response[key].userId._id;
                                mydata["fee"] = response[key].userId.fee;
                                mydata["displayName"] = response[key].userId.displayName;
                                mydata["category"] = response[key].userId.category;
                                mydata["phone"] = response[key].userId.phone;
                                mydata["address"] = response[key].userId.address;
                                mydata["employee"] = response[key].userId.employee;
                                $scope.data.push(mydata);
                            }
                        }
                    });
                    $scope.eventListing = response.length;
                    $scope.SingleEventPage1 = 0;
                    $scope.SingleEventPageSize1 = 5;
                    $scope.numberOfPages1=function(){
                        return Math.ceil($scope.eventListing/$scope.SingleEventPageSize1);                
                    }
                }
                $scope.showLoader = false ;
            }).error(function(err,status,header,config){
                console.log("Comes in error section",err);    
            });
        }
        $scope.backToClient = function() {
            $scope.active = true;
        }

        $scope.setIndex = function($index) {
            $scope.tabIndex = $index;
        }

        $scope.events = [];
        /** calander view code starts from here **/
        var localData = JSON.parse(LocalStorage.getData());
        if (localData && localData.id) {
            $http.post('/api/getCalanderListingForVendor', {
                'id': localData.id
            })
                .success(function(res, status, config, header) {
                    var date = new Date() ;
                    for (var i = 0; i < res.length; i++) {
                        $scope.events.push({
                            id: res[i].id,
                            title: res[i].title,
                            start: res[i].start,
                            className: moment(date).isAfter(res[i].start) ? 'calanderPastDate' : 'CalanderFutureDate'  
                        });
                    }
                }).error(function(err, status, config, header) {
                    console.log("Error occured to fetching bookings.");
                });
        } else {
            $window.location.href = '/#!/signin';
        }

        /* alert on Drop */
        $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        };
        /* alert on Resize */
        $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };

        /* Change View */
        $scope.changeView = function(view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };

        $scope.alertOnEventClick = function(data, jsEvent, view) {
            var deleteConfirm = confirm('Are you sure to delete?');
            if (deleteConfirm) {
                var id = data.id;
                var d = new Date(data._start._i);
                var bookdate = moment(d).format('ll')
                $http.post('/api/deleteCalanderEvent', {
                    id: id,
                    start: bookdate
                }).success(function(res) {
                    if (res && !res.message) {
                        for (var i = 0; i < $scope.events.length; i++) {
                            if ($scope.events[i].start == data.start._i) {
                                $scope.events.splice($scope.events.indexOf($scope.events[i]), 1);
                            }
                        }
                    } else {
                        if (res && res.message) {
                            alert(res.message);
                        } else {
                            alert('Something happemed wrong,Please try again!!');
                        }
                    }
                });
            } else {
                alert("Request cancelled");
            }
        };

        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender
            }
        };

        /* event sources array*/
        $scope.eventSources = [$scope.events];

        /** calander event closed from here **/
        $scope.setFilter = function(date) {
            if (date && date != undefined) {
                $scope.searchDate = moment(date).format('ll')
            }
        }
        
        $scope.resetFilter = function(){
            $scope.dt1 = null ;
            $scope.searchDate = null ;
        }
        
        $scope.toggleModal = function(index) {
            index = $scope.data.indexOf(index);
            var modalInstance = $modal.open({
                templateUrl: 'confirmBooking.html',
                controller: 'bookEventConfirm',
                resolve: {
                    items: function() {
                        $scope.bind = $scope.data[index];
                        return $scope.bind;
                    },
                    calander: function() {
                        $scope.calender = $scope.events;
                        return $scope.calender;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
    }
]);

/**
 *  Adding controller for vendor added by admin
 **/
app.controller('bookEventConfirm', ['$scope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication', 'calander', 'LocalStorage',
    function($scope, $modalInstance, $http, $timeout, items, Authentication, calander, LocalStorage) {

        $scope.bookData = items;
        $scope.events = calander;

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        //get userinfo from localstorage
        var user = JSON.parse(LocalStorage.getData());
        $scope.bookEvent = function(data) {
            if (data) {
                var bookObj = {
                    'vendorId': user.id,
                    'eventName': data.id,
                    'bookingdate': data.date,
                    'fee': data.fee,
                    'category': data.category,
                    'eventId': data.id,
                    'clientId': data.clientId
                };
            }
            if (bookObj !== null) {
                $http.post('/api/bookEvent', bookObj).success(function(response) {
                    var eventDate = moment(data.date).format('YYYY-MM-DD');
                    if (response) {
                        $http.get('/api/getCalanderListing/' + response.bookingId).success(function(res) {
                            //start code to push event in calander
                            var calanderData = {
                                id: res[0].id,
                                title: res[0].title,
                                start: res[0].start,
                                className: res[0].start
                            };
                            $scope.events.push(calanderData);
                            $scope.showForgetSuccess = true;
                            $scope.successMsg = 'Event booked successfully';
                            $timeout(function() {
                                $scope.showForgetSuccess = false;
                                $scope.successMsg = '';
                                $modalInstance.dismiss('cancel');
                            }, 1000);
                        });
                    }
                    //closed push event to calander
                }).error(function(response) {
                    $scope.showForgetError = true;
                    $scope.errorMsg = response.message;
                    $timeout(function() {
                        $scope.showForgetError = false;
                        $scope.errorMsg = '';
                        $modalInstance.dismiss('cancel');
                    }, 1000);
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                }, 1000);
            }
        }
    }
]);

