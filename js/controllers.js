'use strict';

/* Controllers */

angular.module('Alkomap.controllers', [])

/**
 * Vanues controller. Makes: navigation, map
 * @param  {[object]} $scope  [Application model]
 * @param  {[object]} $filter
 * @param  {[object]} categoriesService [A resource object]
 * @return null
 */
.controller('VenuesController', ['$scope', '$rootScope', '$filter', '$location', '$modal', '$routeParams', 'localStorageService', 'venueService', 'geolocation', 'googleMaps', 'Categories', function($scope, $rootScope, $filter, $location, $modal, $routeParams, localStorageService, venueService, geolocation, googleMaps, Categories) {

    $scope.nightlifeCatId = '4d4b7105d754a06376d81259';

    $rootScope.categoriesVisible = false;
    $rootScope.activeClass = '';
    $rootScope.showCategories = function () {
        $rootScope.categoriesVisible = !$rootScope.categoriesVisible;
        $rootScope.activeClass = ($rootScope.activeClass === '') ? 'active' : '';
    }

    //Get categories links for navigation    
    Categories.success(function (data, status) {
        $scope.categories = $filter('categoriesFilter')(data.response.categories, $scope.nightlifeCatId);
    });

    /**
     * Get venues list for the selected category and coords
     * @return {[type]} [description]
     */
    $scope.loadVenues = function () {
        var catId = $routeParams.catId || $scope.nightlifeCatId;
        venueService.query($rootScope.lat+','+$rootScope.lng, catId).get(function (data) {

            $scope.venues = $filter('orderBy')(data.response.venues, 'location.distance');

            if ($rootScope.loadVenuesButton) {
                $rootScope.hideAlert();
            }

            googleMaps.addVenueMarkers($scope.venues);
        });
    };

    geolocation.getLocation().then(function(data){
        $rootScope.lat = data.coords.latitude;
        $rootScope.lng = data.coords.longitude;
        googleMaps.init($rootScope.lat, $rootScope.lng, 'map', true, true);
        $scope.loadVenues();
    });

    // Open modal window for the first site visit    
    $scope.openModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'partials/modal.html',
            controller: ModalInstanceCtrl
        });
    };
    if (!localStorageService.getObjectProperty('alkomap', 'modal')) {
        $scope.openModal();
    }

    //After draging user marker.
    $rootScope.loadVenuesButton = false;
    $rootScope.hideAlert = function () {
        $rootScope.loadVenuesButton = !$rootScope.loadVenuesButton;
    };

    //On venue hover
    $scope.openInfoWindow = function (e, venue) {
        googleMaps.openInfoWindow(venue);
    }
    
}])

.controller('VenueController', ['$scope', '$rootScope', '$routeParams', '$filter', 'Categories', 'Venue', 'googleMaps', 'localStorageService', 'toaster', function($scope, $rootScope, $routeParams, $filter, Categories, Venue, googleMaps, localStorageService, toaster) {

    $scope.venueId = $routeParams.venueId;

    $scope.nightlifeCatId = '4d4b7105d754a06376d81259';
    $rootScope.categoriesVisible = false;
    $rootScope.activeClass = '';
    $rootScope.showCategories = function () {
        $rootScope.categoriesVisible = !$rootScope.categoriesVisible;
        $rootScope.activeClass = ($rootScope.activeClass === '') ? 'active' : '';
    }

    //Get categories links for navigation  
    Categories.success(function (data, status) {
        $scope.categories = $filter('categoriesFilter')(data.response.categories, $scope.nightlifeCatId);
    });

    //Get venue details
    Venue.query($scope.venueId).get(function (data) {
        $scope.venue = data.response.venue;
        googleMaps.init(data.response.venue.location.lat, data.response.venue.location.lng, 'venueMap');
        googleMaps.addVenueMarker();
    });

    $scope.addToFavourites = function () {
        var venue = {
            id: $scope.venue.id,
            name: $scope.venue.name,
            address: $scope.venue.location.address
        };

        if (localStorageService.setObject('favourites', venue)) {
            toaster.pop('success', "Круто!", "Место добавлено в избранное.");
        } else {
            toaster.pop('error', "Упс!", "Это место уже есть в избранном.");
        }
    }
}])


.controller('FavouritesController', ['$scope','$rootScope', '$filter', 'localStorageService', 'Categories',function($scope, $rootScope, $filter, localStorageService, Categories){

    $scope.nightlifeCatId = '4d4b7105d754a06376d81259';
    $rootScope.categoriesVisible = false;
    $rootScope.activeClass = '';
    $rootScope.showCategories = function () {
        $rootScope.categoriesVisible = !$rootScope.categoriesVisible;
        $rootScope.activeClass = ($rootScope.activeClass === '') ? 'active' : '';
    }

    //Get categories links for navigation  
    Categories.success(function (data, status) {
        $scope.categories = $filter('categoriesFilter')(data.response.categories, $scope.nightlifeCatId);
    });
    
    $scope.favourites = localStorageService.getObject('favourites');
}]);

/**
 * Modal window controller
 * @param {[object]} $scope
 * @param {[object]} $modalInstance [modal window instance]
 */
var ModalInstanceCtrl = function ($scope, $modalInstance, localStorageService) {
    $scope.closeModal = function () {
        $modalInstance.close();
        localStorageService.mergeLocalStorage('alkomap', {modal: true});
    };
};

