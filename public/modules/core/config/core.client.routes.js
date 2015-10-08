'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('/', {
            url: '/',
            templateUrl: 'modules/users/views/authentication/signin.client.view.html'
        })
        //Admin Section Routes
        .state('adminDashboard', {
            url: '/admin/dashboard',
            templateUrl: 'modules/users/views/adminSection/admin.section.layout.view.html',
            name: 'adminDashboard'
        })
            .state('adminDashboard.booking', {
                url: '/bookingListing',
                templateUrl: 'modules/users/views/adminSection/home.admin_booking.view.html',
                name: 'adminDashboard.booking',
                controller: 'BookingController'
            })
            .state('adminDashboard.VendorListing', {
                url: '/vendorListing',
                templateUrl: 'modules/users/views/adminSection/home.admin_vendor.view.html',
                name: 'adminDashboard.VendorListing',
                controller: 'VendorController'
            })
            .state('adminDashboard.ClientListing', {
                url: '/clientListing',
                templateUrl: 'modules/users/views/adminSection/home.admin_client.view.html',
                name: 'adminDashboard.ClientListing',
                controller: 'ClientController'
            })
            .state('adminDashboard.EventListing', {
                url: '/eventListing',
                templateUrl: 'modules/users/views/adminSection/home.admin_addEvents.view.html',
                name: 'adminDashboard.EventListing',
                controller: 'EventController'
            })
            .state('adminDashboard.OurPolicy', {
                url: '/ourPolicies',
                templateUrl: 'modules/users/views/adminSection/home.admin_ourPolicies.view.html',
                name: 'adminDashboard.OurPolicy',
                controller: 'PolicyController'
            })
            .state('adminDashboard.Contact', {
                url: '/contact',
                templateUrl: 'modules/users/views/adminSection/home.admin_contact.view.html',
                name: 'adminDashboard.Contact',
                controller: 'PolicyController'
            })
            .state('adminDashboard.Help', {
                url: '/help',
                templateUrl: 'modules/users/views/adminSection/home.admin_help.view.html',
                name: 'adminDashboard.Help',
                controller: 'PolicyController'
            })
        //Vendor Section Routes
        .state('vendorDashboard', {
            url: '/vendor/dashboard',
            templateUrl: 'modules/users/views/vendorSection/home.vendor.view.html',
            name: 'vendorDashboard'
        })
        //Client Section Routes
        .state('register', {
            url: '/register',
            templateUrl: 'modules/users/views/authentication/signup.client.view.html',
            name: 'register',
            controller: 'signUpController'
        })
        .state('clientDashboard', {
            url: '/client/dashboard',
            templateUrl: 'modules/users/views/clientSection/home.client.view.html',
            name: 'clientDashboard',
            controller: 'clientDashboardController'
        })
        .state('clientDashboard.booking', {
            url: '/booklist',
            templateUrl: 'modules/users/views/clientSection/home.client_booking.view.html',
            name: 'clientDashboard.booking',
            controller: 'clientBookingController'
        })
        .state('clientDashboard.VendorListing', {
            url: '/vendorsList',
            templateUrl: 'modules/users/views/clientSection/home.client_vendor.view.html',
            name: 'clientDashboard.VendorListing',
            controller: 'clientVendorController'
        })
        .state('clientDashboard.Vendorbooking', {
            url: '/vendorbooking',
            templateUrl: 'modules/users/views/clientSection/home.vendor_book.view.html',
            name: 'clientDashboard.VendorBooking',
            controller: 'clientVendorBookController'
        })
        //Our policy static pages route
        .state('guidelines', {
            url: '/ourGuidelines',
            templateUrl: 'modules/users/views/guidelines.client.view.html',
            name: 'ourGuidelines',
            controller: 'PolicyController'
        })
        .state('contactus', {
            url: '/ourContact',
            templateUrl: 'modules/users/views/contactus.client.view.html',
            name: 'ourContact',
            controller: 'PolicyController'
        })
        .state('help', {
            url: '/ourHelp',
            templateUrl: 'modules/users/views/help.client.view.html',
            name: 'ourHelp',
            controller: 'PolicyController'
        });
    }
]);