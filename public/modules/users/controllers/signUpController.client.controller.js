'use strict';
var app = angular.module('users');

app.controller('signUpController', ['$scope', '$http', '$location', 'Authentication', '$timeout', 'LocalStorage', '$modal',
    function($scope, $http, $location, Authentication, $timeout, LocalStorage, $modal) {

        $scope.authentication = Authentication;
        $scope.localData = JSON.parse(LocalStorage.getData());

        $scope.signup = function() {
            //$scope.credentials.roles = 'vendor';
            $http.post('/auth/signup', $scope.credentials).success(function(response) {
                // If successful we assign the response to the global user model
                $scope.authentication.user = response;
                LocalStorage.setData(JSON.stringify(response));
                if (response.roles[0] == 'vendor') {
                    // And redirect to the vendor-thanks page
                    $location.path('/vendor/success').search({
                        email: $scope.authentication.user.email
                    });
                } else {
                    $location.path('/');
                }
            }).error(function(response) {
                $scope.error = response.message;
                $timeout(function() {
                    $scope.error = '';
                    $scope.error = false;
                }, 2000);
            });
        };
    }
]);
