'use strict';

/* Directives */


angular.module('Alkomap.directives', [])

.directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
}])

/**
 * Builds a header with navigaion menu
 * @param  {[object]} Categories [Service]
 * @param  {[function]} $filter
 * @return {[object]}
 */
.directive('header', ['Categories', '$filter', function(Categories, $filter){
	return {
		restrict: 'A',
		templateUrl: 'partials/directives/header.html',
		link: function($scope, iElm, iAttrs, controller) {

			$scope.nightlifeCatId = '4d4b7105d754a06376d81259';

		    $scope.categoriesVisible = false;
		    $scope.activeClass = '';
		    $scope.showCategories = function () {
		        $scope.categoriesVisible = !$scope.categoriesVisible;
		        $scope.activeClass = ($scope.activeClass === '') ? 'active' : '';
		    }

		    //Get categories links for navigation    
		    Categories.success(function (data, status) {
		        $scope.categories = $filter('categoriesFilter')(data.response.categories, $scope.nightlifeCatId);
		    });
		}
	};
}])

/**
 * Venue categories list
 * @return {[object]}
 */
.directive('categories', function(){
	return {
		restrict: 'A',
		templateUrl: 'partials/directives/categories.html'
	};
});