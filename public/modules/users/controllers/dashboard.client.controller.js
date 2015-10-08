'use strict';
var app = angular.module('users');

app.controller('clientDashboardController', ['$scope', '$http', '$compile', 'uiCalendarConfig',
    function($scope, $http, $compile, uiCalendarConfig) {

    }
]);

app.controller('clientBookingController', ['$scope', '$http', '$timeout', 'Authentication', '$location','LocalStorage',
    function($scope, $http, $timeout, Authentication, $location,LocalStorage) {
        //Add ng-grid for the Booking controller
        $scope.user = JSON.parse(LocalStorage.getData());
        var id = $scope.user.id ;
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
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.myData = pagedData;
            $scope.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    $http.post('/api/getBookingList',{'id':id}).success(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    $http.post('/api/getBookingList',{'id':id}).success(function(largeLoad) {
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
                field: 'bookingdate | date: fullDate',
                displayName: 'Date Booked'
            }, {
                field: 'fee',
                displayName: 'Fee',
                cellTemplate: '<div class="glyphicon glyphicon-usd" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'category',
                displayName: 'Category'
            }, {
                field: 'status',
                displayName: 'Status'
            }]
        };
    }
]);

app.controller('clientVendorController', ['$scope', '$http', '$timeout', 'Authentication', '$location',
    function($scope, $http, $timeout, Authentication, $location) {

        $scope.currentVendor = '';
        $scope.vendorlist = true;
        $scope.vendorInfo = false;

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
            var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
            $scope.myData = pagedData;
            $scope.totalServerItems = data.length;
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.getPagedDataAsync = function(pageSize, page, searchText) {
            setTimeout(function() {
                var data;
                if (searchText) {
                    var ft = searchText.toLowerCase();
                    $http.get('/api/getAllVendorsClientDashboard').success(function(largeLoad) {
                        data = largeLoad.filter(function(item) {
                            return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                        });
                        $scope.setPagingData(data, page, pageSize);
                    });
                } else {
                    $http.get('/api/getAllVendorsClientDashboard').success(function(largeLoad) {
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
                field: 'vendor',
                displayName: 'Vendor',
                cellTemplate: '<div id="bindVendor{{this.row.rowIndex}}" ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'phone',
                displayName: 'Phone',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'email',
                displayName: 'Email',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'latestBooking | date: fullDate',
                displayName: 'Latest Booking',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'category',
                displayName: 'Category',
                cellTemplate: '<div  ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }, {
                field: 'totalOwned',
                displayName: 'Total Owed',
                cellTemplate: '<div class="glyphicon glyphicon-usd" ng-click="foo($index)" ng-bind="row.getProperty(col.field)"></div>'
            }]
        };

        $scope.foo = function(id) {
            $scope.vendorIndex = this.row.rowIndex;
            $scope.currentVendor = $("#bindVendor" + this.row.rowIndex).text();
            $scope.id = this.row.entity.id;
            $scope.data = this.row.entity;
        }

        $scope.$watch('id', function(newVal, oldVal) {
            if (newVal != undefined) {
                $scope.vend = "";
                $http.post('/api/getVendorBookingList', {
                    'id': newVal
                }).success(function(response, header, status, config) {
                    $scope.vendorlist = false;
                    $scope.vendorInfo = true;
                    $scope.vend = response;
                }).error(function(err, header, status, config) {
                    console.log(err, header, status, config);
                });
            }
        }, true);
    }
]);