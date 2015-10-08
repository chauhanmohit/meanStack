'use strict';


var app = angular.module('users');

app.controller('HeaderController', ['$scope', 'Authentication', 'Menus', 'LocalStorage', '$window', '$modal',
    function($scope, Authentication, Menus, LocalStorage, $window, $modal) {
        $scope.authentication = Authentication;
        $scope.localData = JSON.parse(LocalStorage.getData());

        if (Authentication.user == null || Authentication.user == undefined) {
            LocalStorage.clearAll();
            localStorage.clear();
            $scope.authentication = '';
            $window.location.href = '/#!/signin';
        }
        if ($scope.localData == '' || $scope.localData == null || $scope.localData == undefined) {
            $window.location.href = '/#!/signin';
        };

        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        // Collapsing the menu after navigation
        $scope.$on('$stateChangeSuccess', function() {
            $scope.isCollapsed = false;
        });

        //onclick trigger the signout method
        $scope.signOut = function() {
            LocalStorage.clearAll();
            localStorage.clear();
            $scope.authentication = '';
            $window.location.href = '/auth/signout';
        }

        //Modal box code for Edit account information
        $scope.items = JSON.parse(LocalStorage.getData());
        $scope.edit = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'editAccountInformation.html',
                controller: 'editAccountInformation',
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

        //Modal box code for change Password
        $scope.myData = 'Admin change password controller';
        $scope.changePassword = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'changePassword.html',
                controller: 'ChangePasswordController',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.myData;
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
 *	Edit user account information using popBox Controller
 **/
app.controller('editAccountInformation', ['$scope', '$modalInstance', '$http', '$timeout', 'items', 'Users', 'Authentication', 'LocalStorage',
    function($scope, $modalInstance, $http, $timeout, items, Users, Authentication, LocalStorage) {

        $scope.user = Authentication.user;
        $scope.info = items;

        $scope.ok = function() {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.editAccountInfo = function(editInfo) {
            if (editInfo !== null) {
                $scope.success = $scope.error = null;
                var user = new Users(editInfo);
                user.$update(function(response) {
                    if (response.id !== null || response.id !== undefined) {
                        Authentication.user = response;
                        $scope.showForgetSuccess = true;
                        $scope.successMsg = "Account Information updated successfully.";
                        //create object to update localstorage
                        var updateObj = {};
                        updateObj.id = $scope.info.id;
                        updateObj.username = $scope.info.username;
                        updateObj.displayName = response.displayName;
                        updateObj.companyName = response.companyName;
                        updateObj.phone = response.phone;
                        updateObj.email = $scope.info.email;
                        updateObj.roles = $scope.info.roles;
                        updateObj.provider = $scope.info.provider;
                        updateObj.token = $scope.info.token;
                        //call to localstorage update service
                        LocalStorage.updateData("data", updateObj);
                        $scope.editAccountInfoFrm.$setPristine();
                        $timeout(function() {
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }
                }, function(response) {
                    if (response.data.message) {
                        $scope.showForgetError = true;
                        $scope.errorMsg = response.data.message;
                        $timeout(function() {
                            $scope.showForgetError = false;
                            $scope.errorMsg = '';
                            $scope.editAccountInfoFrm.$setPristine();
                        }, 2000);
                    }
                });
            } else {
                $scope.showForgetError = true;
                $scope.errorMsg = 'Empty Fields are not going to be treated.';
                $timeout(function() {
                    $scope.showForgetError = false;
                    $scope.errorMsg = '';
                    $scope.editAccountInfoFrm.$setPristine();
                }, 2000);
            }
        };

        $scope.closeAlert = function(val) {
            if (val == 'success')
                $scope.showForgetSuccess = false;
            if (val == 'error')
                $scope.showForgetError = false;
        };

    }
]);


app.controller('ChangePasswordController', ['$scope', '$modalInstance', '$http', '$timeout', 'items', 'Authentication',
    function($scope, $modalInstance, $http, $timeout, items, Authentication) {

        $scope.token = items;
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.submitChangePassword = function(info) {
            if (info && info !== null) {
                var currentPassword = info.currentPassword;
                var newPassword = info.newPassword;
                var confirmPassword = info.verifyPassword;
                if (newPassword == confirmPassword) {
                    $scope.success = $scope.error = null;
                    $http.post('/users/password', info).success(function(response) {
                        // If successful show success message and clear form
                        $scope.info = null;
                        // Attach user profile
                        Authentication.user = response;
                        // And redirect to the index page
                        $scope.successMsg = true;
                        $scope.successMsg = 'Thanks - your password has been changed successfully'
                        $scope.changePasswordForm.$setPristine();
                        $timeout(function() {
                            $scope.successMsg = false;
                            $scope.successMsg = '';
                            $modalInstance.dismiss('cancel');
                        }, 2000);
                    }).error(function(response) {
                        $scope.showError = true;
                        $scope.error = response.message;
                        $timeout(function() {
                            $scope.showError = false;
                            $scope.error = '';
                        }, 2000);
                    });
                } else {
                    $scope.showError = true;
                    $scope.error = 'Sorry, your new password and confirmed password does not match. Please try again.';
                    $timeout(function() {
                        $scope.showError = false;
                        $scope.error = '';
                    }, 2000);
                }
            } else {
                $scope.showError = true;
                $scope.error = 'Sorry, empty fields are not treated';
                $timeout(function() {
                    $scope.showError = false;
                    $scope.error = '';
                }, 2000);
            }
        }
    }
]);