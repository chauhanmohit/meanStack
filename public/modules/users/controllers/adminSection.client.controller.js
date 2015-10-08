'use strict';

var app = angular.module('users');

app.controller('PolicyController', ['$scope', '$http', '$timeout', 'Authentication', '$location',
    function($scope, $http, $timeout, Authentication, $location) {

        //Guidelines Section
        $scope.guideline = function() {
            $http.post('/api/getGuideline').success(function(response, header, status, config) {
                $scope.guideline = response[0];
            }).error(function(err, header, status, config) {
                console.log(err, header, status, config);
            });
        };

        $scope.editGuideline = function(editObj) {
            if (editObj && editObj !== null && editObj.title && editObj.description) {
                $http.post('/api/editGuideline', editObj).success(function(response, header, status, config) {
                    $scope.showMsg = true;
                    $scope.msg = 'Record Edited Successfully!';
                    $timeout(function() {
                        $scope.showMsg = false;
                        $scope.msg = '';
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            } else {
                $scope.showMsg = true;
                $scope.msg = 'Empty Record is not Editable';
                $timeout(function() {
                    $scope.showMsg = false;
                    $scope.msg = '';
                }, 2000);
            }
        };

        //Help Section
        $scope.help = function() {
            $http.post('/api/getHelp').success(function(response, header, status, config) {
                $scope.help = response[0];
            }).error(function(err, header, status, config) {
                console.log(err, header, status, config);
            });
        };

        $scope.editHelp = function(editObj) {
            if (editObj && editObj !== null && editObj.title && editObj.description) {
                $http.post('/api/editHelp', editObj).success(function(response, header, status, config) {
                    $scope.showMsg = true;
                    $scope.msg = 'Record Edited Successfully!';
                    $timeout(function() {
                        $scope.showMsg = false;
                        $scope.msg = '';
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            } else {
                $scope.showMsg = true;
                $scope.msg = 'Empty Record is not Editable';
                $timeout(function() {
                    $scope.showMsg = false;
                    $scope.msg = '';
                }, 2000);
            }
        };

        //Contact Us Section
        $scope.contact = function() {
            $http.post('/api/getContact').success(function(response, header, status, config) {
                $scope.contact = response[0];
            }).error(function(err, header, status, config) {
                console.log(err, header, status, config);
            });
        };

        $scope.editContact = function(editObj) {
            if (editObj && editObj !== null && editObj.title && editObj.description) {
                $http.post('/api/editContact', editObj).success(function(response, header, status, config) {
                    $scope.showMsg = true;
                    $scope.msg = 'Record Edited Successfully!';
                    $timeout(function() {
                        $scope.showMsg = false;
                        $scope.msg = '';
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            } else {
                $scope.showMsg = true;
                $scope.msg = 'Empty Record is not Editable';
                $timeout(function() {
                    $scope.showMsg = false;
                    $scope.msg = '';
                }, 2000);
            }
        };
    }
]);

app.controller('BookingController', ['$scope', '$http', '$timeout', 'Authentication', '$location',
    function($scope, $http, $timeout, Authentication, $location) {

        /**
         *  Add ng-grid for the Booking controller
         **/
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [250, 500, 1000],
            pageSize: 250,
            currentPage: 1
        };

        $scope.setPagingData = function(data, page, pageSize) {
            if (data && data.message != "No Result found") {
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    $http.get('/api/getAllBookingList').success(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    $http.get('/api/getAllBookingList').success(function(largeLoad) {
                        $scope.setPagingData(largeLoad, page, pageSize);
                    });
                }
            }, 100);
        };

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        $scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('filterOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.gridOptions = {
            data: 'myData',
            enablePaging: true,
            showFooter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            selectedItems: [],
            multiSelect: false,
            showFilter: true,
            columnDefs: [{
                field: 'created | date: fullDate',
                displayName: 'Date'
            }, {
                field: 'vendor',
                displayName: 'Vendor'
            }, {
                field: 'client',
                displayName: 'Client'
            }, {
                field: 'bookingdate | date: fullDate',
                displayName: 'Date Booked'
            }, {
                field: 'fee',
                displayName: 'Fee',
                cellTemplate: '<div class="glyphicon glyphicon-usd" ng-bind="row.getProperty(col.field)"></div>'
            }]
        };

        $scope.$on('ngGridEventData', function(event, data) {
            $(".hide-hand .ngViewport .ng-scope").css("cursor", "auto");
        });

    }
]);


app.controller('VendorController', ['$scope', '$http', '$timeout', 'Authentication', '$location', '$modal', '$state',
    function($scope, $http, $timeout, Authentication, $location, $modal, $state) {
        
        $scope.myData = [];
        $scope.showForgetSuccess = false;
        $scope.showForgetError = false;
        $scope.itemdata = 'add Vendor From here';
        $scope.infoVendorDiv = false;

        // add vendor pop action perform here
        $scope.addVendor = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'addVendorTemplate.html',
                controller: 'addVendorFromAdmin',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.itemdata;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        // edit vendor pop action perform here
        $scope.editVendor = function(size) {
            $scope.vendorIndex = this.row.rowIndex;
            $scope.data = this.row.entity;
            var modalInstance = $modal.open({
                templateUrl: 'editVendorTemplate.html',
                controller: 'editVendorFromAdmin',
                size: size,
                resolve: {
                    items: function() {
                        $scope.bind = $scope.data;
                        return $scope.bind;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        /***  ngGrid options and code starts from here **/
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [250, 500, 1000],
            pageSize: 250,
            currentPage: 1
        };

        $scope.setPagingData = function(data, page, pageSize) {
            if (data && data.message != "No Result found") {
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    $http.get('/api/getVendorListing').success(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    $http.get('/api/getVendorListing').success(function(largeLoad) {
                        $scope.setPagingData(largeLoad, page, pageSize);
                    });
                }
            }, 100);
        };

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        $scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('filterOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.gridOptions = {
            data: 'myData',
            enablePaging: true,
            showFooter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            selectedItems: [],
            multiSelect: false,
            showFilter: true,
            columnDefs: [{
                field: 'displayName',
                displayName: 'Vendor',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'phone',
                displayName: 'Phone',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'email',
                displayName: 'Email',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'category',
                displayName: 'Category',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'update',
                displayName: 'Update',
                cellTemplate: '<input type="button" class="btn btn-success mybtn1" value="Update" ng-click="editVendor($index)" />'
            }, {
                field: 'remove',
                displayName: 'Delete',
                cellTemplate: '<input type="button" class="btn btn-success mybtn1" value="Delete" ng-click="removeRow($index)" />'
            }]
        };

        //bind vendor info to show in div on click row
        $scope.foo = function(id) {
            $scope.vendorIndex = this.row.rowIndex;
            $scope.infoVendorDiv = true;
            $scope.data = this.row.entity;
            if ($scope.data) {
                $http.get('/api/getSingleBooking/' + $scope.data.id).success(function(response) {
                    $scope.bookingInfo = response;
                    $scope.SingleEventPage = 0;
                    $scope.SingleEventPageSize = 5;
                    $scope.numberOfPages=function(){
                        return Math.ceil($scope.bookingInfo.length/$scope.SingleEventPageSize);                
                    }
                });
            }
        }

        $scope.changeState = function() {
            $scope.infoVendorDiv = false;
        }

        $scope.$on('addGridVendorData', function(event, data) {
            if (data && data != undefined) {
                $scope.myData.push(data);
            }
        });

        $scope.removeRow = function() {
            var deleteConfirm = confirm('Are you sure to delete?');
            if (deleteConfirm) {
                var index = this.row.rowIndex;
                var deleteObj = this.row.entity;
                $http.post('/api/deleteVendor', deleteObj).success(function(res) {
                    $scope.gridOptions.selectItem(index, false);
                    $scope.myData.splice(index, 1);
                });
            } else {
                console.log("Request Cancelled");
            }
        };

        $scope.deleteVendor = function(deleteObj) {
            if (deleteObj) {
                var deleteConfirm = confirm('Are you sure to delete?');
                if (deleteConfirm) {
                    $http.post('/api/deleteVendor', deleteObj).success(function(res, header, status, config) {
                        console.log(res, header, status, config);
                        $scope.gridOptions.selectItem($scope.index, false);
                        $scope.myData.splice($scope.index, 1);
                    }).error(function(err, header, status, config) {
                        console.log("Err occur", err, header, status, config);
                    });
                } else {
                    alert("Nothing to Delete");
                }
            }
        };
    }
]);

app.controller('ClientController', ['$scope', '$http', '$timeout', 'Authentication', '$location', '$modal','$state',
    function($scope, $http, $timeout, Authentication, $location, $modal,$state) {
        $scope.eventInfo = [] ;
        $scope.myData1 = [];
        $scope.showForgetSuccess = false;
        $scope.showForgetError = false;
        $scope.itemdata = 'add Client From here';
        $scope.infoClientDiv = false;

        // add client pop action perform here
        $scope.addClient = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'addClientTemplate.html',
                controller: 'addClientFromAdmin',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.itemdata;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
        
        $scope.filterOptions = {
            filterText: "",
            useExternalFilter: true
        };

        $scope.totalServerItems = 0;

        $scope.pagingOptions = {
            pageSizes: [250, 500, 1000],
            pageSize: 250,
            currentPage: 1
        };

        $scope.setPagingData = function(data, page, pageSize) {
            if (data && data.message != "No Result found") {
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData1 = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    $http.get('/api/getClientListing').success(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    $http.get('/api/getClientListing').success(function(largeLoad) {
                        $scope.setPagingData(largeLoad, page, pageSize);
                    });
                }
            }, 100);
        };

        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        $scope.$watch('pagingOptions', function(newVal, oldVal) {
            if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.$watch('filterOptions', function(newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }
        }, true);

        $scope.gridOptions = {
            data: 'myData1',
            enablePaging: true,
            //plugins: [new ngGridCsvExportPlugin()],
            showFooter: true,
            totalServerItems: 'totalServerItems',
            pagingOptions: $scope.pagingOptions,
            filterOptions: $scope.filterOptions,
            selectedItems: [],
            multiSelect: false,
            showFilter: true,
            columnDefs: [{
                field: 'displayName',
                displayName: 'Name',
                cellTemplate: '<div  ng-click="clientData($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'phone',
                displayName: 'Phone',
                cellTemplate: '<div  ng-click="clientData($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'email',
                displayName: 'Email',
                cellTemplate: '<div  ng-click="clientData($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'update',
                displayName: 'Edit',
                cellTemplate: '<input type="button" class="btn btn-success mybtn1" value="Update" ng-click="editClient($index)" />'
            }, {
                field: 'remove',
                displayName: 'Delete',
                cellTemplate: '<input type="button" class="btn btn-success mybtn1" value="Delete" ng-click="removeRow($index)" />'
            }]
        };

        $scope.clientData = function(id) {
            $scope.clientIndex = this.row.rowIndex;
            $scope.infoClientDiv = true;
            $scope.data = this.row.entity;
            if ($scope.data) {
                $http.get('/api/getSingleEvent/' + $scope.data.id).success(function(response) {
                    $scope.eventInfo  = response ;
                    $scope.SingleEventPage = 0;
                    $scope.SingleEventPageSize = 5;
                    $scope.numberOfPages=function(){
                        return Math.ceil($scope.eventInfo.length/$scope.SingleEventPageSize);                
                    }
                });
            }

        }
        
        $scope.changeState = function() {
            $scope.infoClientDiv = false;
        }

        $scope.addEvent = function(name, size) {
            var modalInstance = $modal.open({
                templateUrl: 'addEventTemplate.html',
                controller: 'addEventFromAdmin',
                size: size,
                resolve: {
                    items: function() {
                        $scope.itemdata = name;
                        return $scope.itemdata;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log("Model dissmed successfully");
            });
        };

        $scope.$on('addGridEventData', function(event, data) {
            console.log("the event data is as follows", data);
            $scope.eventInfo.push(data);
            console.log("the data is as follows",$scope.eventInfo);
        });

        $scope.editEvent = function(id, size) {
            $scope.index = id;
            $http.get('/api/getEvent/' + $scope.index).success(function(response) {
                $scope.event = response[0];
                var modalInstance = $modal.open({
                    templateUrl: 'editEventTemplate.html',
                    controller: 'editEventFromAdmin',
                    size: size,
                    resolve: {
                        items: function() {
                            $scope.bind = $scope.event;
                            return $scope.bind;
                        }
                    }
                });
                modalInstance.result.then(function(selectedItem) {
                    $scope.selected = selectedItem;
                }, function() {
                    console.log('Modal dismissed at: ' + new Date());
                });
            });
        };

        $scope.myData = [];
        $scope.removeEvent = function(index, info) {
            var deleteConfirm = confirm('Are you sure to delete?');
            if (deleteConfirm) {
                var eventIndex = index;
                var deleteObj = info;
                $http.post('/api/deleteEvent', deleteObj).success(function(res) {
                    $scope.gridOptions.selectItem(index, false);
                    $scope.eventInfo.splice(index, 1);
                   // $scope.infoClientDiv = false;
                }).error(function(err){
                    alert(err.message)    
                });
            } else {
                console.log("Request Cancelled");
            }
        };


        $scope.$on('addGridClientData', function(event, data) {
            $scope.myData1.push(data);
        });

        $scope.removeRow = function() {
            var deleteConfirm = confirm('Are you sure to delete?');
            if (deleteConfirm) {
                var index = this.row.rowIndex;
                var deleteObj = this.row.entity;
                $http.post('/api/deleteVendor', deleteObj).success(function(res) {
                    $scope.gridOptions.selectItem(index, false);
                    $scope.myData1.splice(index, 1);
                });
            } else {
                console.log("Request Cancelled");
            }
        };

        $scope.editClient = function(size) {
            $scope.vendorIndex = this.row.rowIndex;
            $scope.data = this.row.entity;
            var modalInstance = $modal.open({
                templateUrl: 'editClientTemplate.html',
                controller: 'editClientFromAdmin',
                size: size,
                resolve: {
                    items: function() {
                        $scope.bind = $scope.data;
                        return $scope.bind;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.deleteClient = function(deleteObj) {
            if (deleteObj) {
                var deleteConfirm = confirm('Are you sure to delete?');
                if (deleteConfirm) {
                    $http.post('/api/deleteClient', deleteObj).success(function(res, header, status, config) {
                        console.log(res, header, status, config);
                        $scope.gridOptions.selectItem($scope.index, false);
                        $scope.myData1.splice($scope.index, 1);
                    }).error(function(err, header, status, config) {
                        console.log("Err occure", err, header, status, config);
                    });
                } else {
                    alert("Nothing to Delete");
                }
            }
        };
    }
]);

/**
 *  Adding controller for vendor added by admin
 **/
app.controller('addVendorFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication) {

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.addVendor = function(data) {
            if (data && data !== null) {
                if (data.password == data.cpassword) {
                    data.roles = 'vendor';
                    $http.post('/auth/signup', data).success(function(response) {
                        // If successful we assign the response to the global user model
                        $rootScope.$broadcast('addGridVendorData', data);
                        $scope.showForgetSuccess = true;
                        $scope.successMsg = 'Vendor added successfully, and confirmation email has been sent to the entred email address';
                        $scope.info.push = response;
                        $scope.addVendorTplFrm.$setPristine();
                        $timeout(function() {
                            $scope.showForgetSuccess = false;
                            $scope.successMsg = '';
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }).error(function(response) {
                        $scope.showForgetError = true;
                        $scope.errorMsg = response.message;
                        $timeout(function() {
                            $scope.showForgetError = false;
                            $scope.errorMsg = '';
                        }, 2000);
                    });
                } else {
                    $scope.showForgetError = true;
                    $scope.errorMsg = 'Confirm and desired password are not matched,please fill again.';
                    $timeout(function() {
                        $scope.showForgetError = false;
                        $scope.errorMsg = '';
                    }, 2000);
                }
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                }, 2000);
            }
        }
    }
]);

// Adding controller for Edit vendor by admin
app.controller('editVendorFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication) {

        $scope.info = items;
        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.editVendor = function(editObj) {
            if (editObj && editObj !== undefined && editObj.displayName && editObj.email && editObj.phone && typeof editObj.category !== 'undefined') {
                $http.post('/api/editVendor', editObj).success(function(response, header, status, config) {
                    $scope.showForgetSuccess = true;
                    $scope.successMsg = 'Vendor Updated Successfully!';
                    $timeout(function() {
                        $scope.showForgetSuccess = false;
                        $scope.successMsg = '';
                        $modalInstance.dismiss('cancel');
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty or Invalid Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                }, 2000);
            }
        };
    }
]);

/**
 *  Adding controller for client added by admin
 **/
app.controller('addClientFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication) {

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.addClient = function(data) {
            if (data !== null) {
                if (data.password == data.cpassword) {
                    data.roles = 'client';
                    $http.post('/auth/signup', data).success(function(response) {
                        // If successful we assign the response to the global user model
                        $rootScope.$broadcast('addGridClientData', data);
                        $scope.showForgetSuccess = true;
                        $scope.successMsg = 'Client added successfully, and confirmation email has been sent to the entred email address';
                        $scope.info = '';
                        $scope.addClientTplFrm.$setPristine();
                        $timeout(function() {
                            $scope.showForgetSuccess = false;
                            $scope.successMsg = '';
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }).error(function(response) {
                        $scope.showForgetError = true;
                        $scope.errorMsg = response.message;
                        $timeout(function() {
                            $scope.showForgetError = false;
                            $scope.errorMsg = '';
                        }, 2000);
                    });
                } else {
                    $scope.showForgetError = true;
                    $scope.errorMsg = 'Confirm and desired password are not matched,please fill again.';
                    $timeout(function() {
                        $scope.showForgetError = false;
                        $scope.errorMsg = '';
                    }, 2000);
                }
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                }, 2000);
            }
        }
    }
]);

/**
 *  Adding controller for client added by admin
 **/
app.controller('editClientFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication) {

        $scope.info = items;
        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.editClient = function(editObj) {
            if (editObj && editObj !== null && editObj.displayName && editObj.email && editObj.phone && editObj.fee) {
                $http.post('/api/editClient', editObj).success(function(response, header, status, config) {
                    $scope.showForgetSuccess = true;
                    $scope.successMsg = 'Client Updated Successfully!';
                    $timeout(function() {
                        $scope.showForgetSuccess = false;
                        $scope.successMsg = '';
                        $modalInstance.dismiss('cancel');
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty or Invalid Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                }, 2000);
            }
        };
    }
]);

app.controller('addEventFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication', '$filter',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication, $filter) {

        //initialize scope for add event page
        $scope.info = {};

        //Datepicker to add Date Array
        $scope.selectedDates = [];
        this.activeDate;
        this.selectedDates = [];

        $scope.addDate = function(selectedDates) {
            var mydate;
            $scope.info.date = [];
            angular.forEach(selectedDates, function(value, key) {
                mydate = $filter('date')(selectedDates[key]);
                $scope.info.date.push(mydate);
            });
        }

        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };

        $http.get('/api/getClientListing').success(function(clients) {
            $scope.info.userId = {};
            angular.forEach(clients, function(value, key) {
                if (items == clients[key].displayName) {
                    console.log(clients[key].displayName);
                    $scope.info.userId = clients[key];
                }
            });
            //set minimum date for add event
            $scope.minDate = new Date();
        });

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        //register Event form admin section
        $scope.addEvent = function(data) {
            if (data !== undefined || data !== null) {
                data.userId = $scope.info.userId.id;
                console.log("the data is as follows",data.date);
                $http.post('/api/addevent', data).success(function(response) {
                    $rootScope.$broadcast('addGridEventData', response);
                    $scope.showForgetSuccess = true;
                    $scope.successMsg = 'New building added successfully!';
                    $timeout(function() {
                        $scope.showForgetSuccess = false;
                        $scope.successMsg = '';
                        $modalInstance.dismiss('cancel');
                    }, 2000);
                }).error(function(err){
                    if (err.message) {
                        $scope.showForgetSuccess = true;
                        $scope.successMsg = err.message;
                        $timeout(function() {
                            $scope.showForgetSuccess = false;
                            $scope.successMsg = '';
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                },1000);
            }
        }
    }
]);

app.controller('editEventFromAdmin', ['$scope', '$rootScope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $rootScope, $modalInstance, $http, $timeout, items, Authentication) {

        //initialize scope for edit event page
        $scope.info = items;
        $scope.myselect = $scope.info.userId.displayName;
        $scope.fee = $scope.info.userId.fee;

        //Datepicker to add Date Array
        $scope.selectedDates = [];
        this.activeDate;
        this.selectedDates = [];
        this.removeFromSelected = function(dt) {
            this.selectedDates.splice(this.selectedDates.indexOf(dt), 1);
        }

        $scope.addDate = function(selectedDates) {
            //date conversion acc to db
            $scope.info.date = [];
            var dated;
            for (var i = 0; i < selectedDates.length; i++) {
                dated = moment(selectedDates[i]).format('ll');
                $scope.info.date.push(dated);
            }
        }

        $scope.getDate = function() {
            //date conversion acc to datepicker
            $scope.selectedDates = [];
            if ($scope.info && $scope.info.date) {
                var datelength = $scope.info.date.length;
                for (var i = 0; i < datelength; i++) {
                    var mydt = new Date($scope.info.date[i]);
                    var milliseconds = mydt.getTime();
                    $scope.selectedDates.push(milliseconds);
                }
            }
        };

        $scope.open = function($event, opened) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope[opened] = true;
        };

        $http.get('/api/getClientListing').success(function(clients) {
            $scope.users = clients;
            $scope.minDate = new Date(); //set minimum date for add event
            $scope.getDate(); //get date for datepicker to bind
        });

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.editEvent = function(editObj) {
            if (editObj !== undefined || editObj !== null) {
                editObj.userId = $scope.info.userId._id;
                $http.post('/api/editEvent', editObj).success(function(response, header, status, config) {
                    $rootScope.$broadcast('updateGridEventData', response, response.userId);
                    $scope.showForgetSuccess = true;
                    $scope.successMsg = 'Event Updated Successfully!';
                    $timeout(function() {
                        $scope.showForgetSuccess = false;
                        $scope.successMsg = '';
                        $modalInstance.dismiss('cancel');
                    }, 2000);
                }).error(function(err, header, status, config) {
                    console.log("Err occured", err, header, status, config);
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty or Invalid Fields are not treated';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $modalInstance.dismiss('cancel');
                }, 2000);
            }
        }
    }
]);

app.filter('arrayToList', function() {
    return function(arr) {
        return typeof arr == 'object' ? arr.join("\n") : arr;
    }
});

app.filter('startFrom', function() {
    return function(input, start) {
        if (input !== undefined) {
            start = +start; //parse to int
            return input.slice(start);
        }
        
    }
});
