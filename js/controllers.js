'use strict';

/* Controllers */

angular.module('Alkomap.controllers', [])

/**
 * Builds venues list and a map
 * @param  {[object]} $scope
 * @param  {[object]} $rootScope
 * @param  {[object]} $filter
 * @param  {[object]} $modal
 * @param  {[object]} $routeParams
 * @param  {[object]} LocalStorage [service]
 * @param  {[object]} Venues       [service]
 * @param  {[object]} Geolocation  [service]
 * @param  {[object]} GoogleMaps   [service]
 * @return {[null]}
 */
.controller('VenuesController', ['$scope', '$rootScope', '$filter', '$modal', '$routeParams', 'LocalStorage', 'Venues', 'Geolocation', 'GoogleMaps', function($scope, $rootScope, $filter, $modal, $routeParams, LocalStorage, Venues, Geolocation, GoogleMaps) {

    $scope.nightlifeCatId = '4d4b7105d754a06376d81259';

    /**
     * Get venues list for the selected category and coords
     * @return {[type]} [description]
     */
    $scope.loadVenues = function () {
        var catId = $routeParams.catId || $scope.nightlifeCatId;
        Venues.query($rootScope.lat+','+$rootScope.lng, catId).get(function (data) {
            $scope.venues = $filter('orderBy')(data.response.venues, 'location.distance');
            if ($rootScope.loadVenuesButton) {
                $rootScope.hideAlert();
            }
            GoogleMaps.addVenueMarkers($scope.venues);
        });
    };

    Geolocation.getLocation().then(function(data){
        $rootScope.lat = data.coords.latitude;
        $rootScope.lng = data.coords.longitude;
        GoogleMaps.init($rootScope.lat, $rootScope.lng, 'map', true, true);
        $scope.loadVenues();
    });

    // Open modal window for the first site visit    
    $scope.openModal = function () {
        var modalInstance = $modal.open({
            templateUrl: 'partials/modal.html',
            controller: ModalInstanceCtrl
        });
    };    
    if (!LocalStorage.getObjectProperty('alkomap', 'modal')) {
        $scope.openModal();
    }

    //After draging user marker.
    $rootScope.loadVenuesButton = false;
    $rootScope.hideAlert = function () {
        $rootScope.loadVenuesButton = !$rootScope.loadVenuesButton;
    };

    //On venue hover
    $scope.openInfoWindow = function (e, venue) {
        GoogleMaps.openInfoWindow(venue);
    }    
}])

/**
 * Builds venue page
 * @param  {[object]} $scope
 * @param  {[object]} $routeParams
 * @param  {[object]} Venue               [service]
 * @param  {[object]} GoogleMaps          [service]
 * @param  {[object]} LocalStorage        [service]
 * @param  {[object]} toaster             [service]
 * @return {[null]}
 */
.controller('VenueController', ['$scope', '$routeParams', 'Venue', 'GoogleMaps', 'LocalStorage', 'toaster', function($scope, $routeParams, Venue, GoogleMaps, LocalStorage, toaster) {

    $scope.venueId = $routeParams.venueId;

    //Get venue details
    Venue.query($scope.venueId).get(function (data) {
        $scope.venue = data.response.venue;
        GoogleMaps.init(data.response.venue.location.lat, data.response.venue.location.lng, 'venueMap');
        GoogleMaps.addVenueMarker();
    });

    $scope.addToFavourites = function () {
        var venue = {
            id: $scope.venue.id,
            name: $scope.venue.name,
            address: $scope.venue.location.address
        };

        if (LocalStorage.setObject('favourites', venue)) {
            toaster.pop('success', "Круто!", "Место добавлено в избранное.");
        } else {
            toaster.pop('error', "Упс!", "Это место уже есть в избранном.");
        }
    }
}])

/**
 * Get favourite venues list
 * @param  {[object]} $scope
 * @param  {[object]} LocalStorage [service]
 * @return {[null]}              [description]
 */
.controller('FavouritesController', ['$scope', 'LocalStorage', function($scope, LocalStorage) {
    $scope.favourites = LocalStorage.getObject('favourites');
}])

/**
 * Modal window controller
 * @param {[object]} $scope         [description]
 * @param {[object]} $modalInstance [description]
 * @param {[object]} LocalStorage   [service]
 */
var ModalInstanceCtrl = function ($scope, $modalInstance, LocalStorage) {
    $scope.closeModal = function () {
        $modalInstance.close();
        LocalStorage.mergeLocalStorage('alkomap', {modal: true});
    };
};

