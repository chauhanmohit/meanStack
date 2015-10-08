'use strict';
var app = angular.module('users');

app.controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$timeout', 'LocalStorage', '$modal',
    function($scope, $http, $location, Authentication, $timeout, LocalStorage, $modal) {
        $scope.authentication = Authentication;
        $scope.localData = JSON.parse(LocalStorage.getData());
        // If user is signed in then redirect back home
         if ($scope.authentication.user && $scope.localData != null ) {
            switch ($scope.authentication.user.roles[0]) {
                case 'admin':
                    $location.path('/admin/dashboard/bookingListing');
                    break;
                case 'vendor':
                    $location.path('/vendor/dashboard');
                    break;
                case 'client':
                    $location.path('/client/dashboard/booklist');
                    break;
                default:
                    $location.path('/');
                    break;
            }
        } else {
            $location.path('/');
        }

        $scope.signin = function() {
            $http.post('/auth/signin', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                LocalStorage.setData(JSON.stringify(response));
                // And redirect to the index page
                if ($scope.authentication.user) {
                    switch ($scope.authentication.user.roles[0]) {
                        case 'admin':
                            $location.path('/admin/dashboard/bookingListing');
                            break;
                        case 'vendor':
                            $location.path('/vendor/dashboard');
                            break;
                        case 'client':
                            $location.path('/client/dashboard/booklist');
                            break;
                        default:
                            $location.path('/');
                            break;
                    }
                }
            }).error(function(response) {
                if ($scope.credentials && $scope.credentials.password) {
                    $scope.credentials.password = "";
                };
                $scope.error = response.message;
                $timeout(function() {
                    $scope.error = response.message;
                    $scope.error = false;
                }, 2000);
            });
        };

        $scope.items = ['item1', 'item2', 'item3'];
        $scope.forgotPassword = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'forgotPassword.html',
                controller: 'forgotPasswordController',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.items;
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


app.controller('forgotPasswordController', ['$scope', '$modalInstance', '$http', '$timeout', 'items',
    function($scope, $modalInstance, $http, $timeout, items) {
        $scope.showSpinner = false;
        $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.showLoader = function() {
            $scope.showSpinner = true;
        }

        $scope.changePassword = function() {
            //console.log('Forget Password', $scope.forgetuser);
            if ($scope.forgetuser) {
                $http.post('/auth/userForgotPassword', $scope.forgetuser).
                success(function(data, status, headers, config) {
                    $scope.showForgetSuccess = true;
                    $scope.showSpinner = false
                    if (data.message) {
                        $scope.successMsg = data.message;
                        $scope.forgetuser.email = '';
                        $scope.forgotPasswordForm.$setPristine();
                        $timeout(function() {
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }
                }).
                error(function(data, status, headers, config) {
                    //console.log(" Error  is >> ", data, status, headers, config);
                    if (data.message) {
                        $scope.showForgetError = true;
                        $scope.errorMsg = data.message;
                        $timeout(function() {
                            $scope.showForgetError = false;
                            $scope.errorMsg = '';
                            $scope.forgotPasswordForm.$setPristine();
                        }, 2000);
                    }
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Request is not going to be treated, Please fill missing parameters';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                }, 1000);
            }
        };

        $scope.closeAlert = function(val) {
            //console.log('call', val);
            if (val == 'success')
                $scope.showForgetSuccess = false;
            if (val == 'error')
                $scope.showForgetError = false;
        };
    }
]);


app.controller('vendorSuccessController', ['$scope', '$http', '$location',
    function($scope, $http, $location) {
        $scope.email = $location.search().email;
    }
]);