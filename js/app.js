'use strict';

// Declare app level module which depends on filters, and services
var Alkomap = angular.module('Alkomap', [
    'ngRoute',
    'ngAnimate',
    'ngResource',
    'Alkomap.filters',
    'Alkomap.services',
    'Alkomap.directives',
    'Alkomap.controllers',
    // 'ui.map',
    'ui.event',
    'ui.bootstrap',
    'chieffancypants.loadingBar',
    'toaster'
]);

Alkomap.config(['$routeProvider', 'cfpLoadingBarProvider', function($routeProvider, cfpLoadingBarProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/venues.html', 
            controller: 'VenuesController'
        })
        .when('/venue/:venueId', {
            templateUrl: 'partials/venue.html', 
            controller: 'VenueController'
        })

        .when('/venues/:catId', {
            templateUrl: 'partials/venues.html', 
            controller: 'VenuesController'
        })

        .when('/favourites', {
            templateUrl: 'partials/favourites.html', 
            controller: 'FavouritesController'
        })

        .otherwise({redirectTo: '/'});

    cfpLoadingBarProvider.includeSpinner = false;
}]);

/**
 * Create new obkect in localStorage if it is not exist
 */
if (!localStorage.alkomap) {
    localStorage.alkomap = JSON.stringify({});
}