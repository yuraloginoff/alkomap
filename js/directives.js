'use strict';

/* Directives */


angular.module('Alkomap.directives', [])

.directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
}])


.directive('header', function(){
	return {
		restrict: 'A',
		templateUrl: 'partials/directives/header.html'
	};
})

.directive('categories', function(){
	return {
		restrict: 'A',
		templateUrl: 'partials/directives/categories.html'
	};
});