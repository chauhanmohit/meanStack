'use strict';

// LocalStorage service for user variables
angular.module('users').factory('LocalStorage',['$window', '$rootScope',function($window, $rootScope) {
	angular.element($window).on('storage', function(event) {
		alert();
		if (event.key === 'user') {
			$rootScope.$apply();
		}
	});
	return {
		setData: function(val) {
			$window.localStorage && $window.localStorage.setItem('data', val);
			return this;
		},
		updateData: function(key, val) {
        	$window.localStorage && window.localStorage.setItem(key, JSON.stringify(val));
        	return this;
		},
		getData: function() {
			return $window.localStorage && $window.localStorage.getItem('data');
		},
		clearAll: function() {
			$window.localStorage && $window.localStorage.setItem('data', null);
		}
	};
}]);