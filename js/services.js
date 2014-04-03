'use strict';

/**
 * Foursquare specific data for requests
 * @type String
 */
var requestParms = {
    clientId: "ZUGVXLS5OOAQ4RYDCDOJHGJJNZPQNRSBAKYU45NJXYIMKFGQ",
    clientSecret: "ZIV3ZCCRSIHWZ2D4QATSHQLSA0B0KYHDSADEX3WW22S5EPWP",
    version: "20140321"
}

/* Services */
angular.module('Alkomap.services', [])

    /**
     * Default service
     */
    .value('version', '0.1')

    /**
     * Get venue categories for navigation
     * @param  {[object]} $resource
     * @return {[object]} $resource
     */
    // .factory('categoriesService', ['$resource', function($resource) {
    //     return {
    //         query: function () {
    //             var url = 'https://api.foursquare.com/v2/venues/categories';
    //             return $resource(url, 
    //                 {
    //                     client_id: requestParms.clientId,
    //                     client_secret: requestParms.clientSecret,
    //                     v: requestParms.version,
    //                     callback: 'JSON_CALLBACK'
    //                 }, {
    //                     get: {method: 'JSONP'}
    //                 }
    //             );
    //         }
    //     };
    // }])

    .factory('Categories', ['$http', function ($http) {
        return $http({
            method: 'JSONP',
            url: 'https://api.foursquare.com/v2/venues/categories',
            params: {
                client_id: requestParms.clientId,
                client_secret: requestParms.clientSecret,
                v: requestParms.version,
                callback: 'JSON_CALLBACK'
            }
        });
    }])

    /**
     * Get venues list
     * @param  {[object]} $resource
     * @return {[object]} $resource
     */
    .factory('venueService', ['$resource', function($resource){
        return {            
            query: function (coords, catId) {
                var url = 'https://api.foursquare.com/v2/venues/search';
                return $resource(url, 
                    {
                        client_id: requestParms.clientId,
                        client_secret: requestParms.clientSecret,
                        v: requestParms.version,
                        ll: coords,
                        categoryId: catId,
                        radius: 1000,
                        callback: 'JSON_CALLBACK'
                    }, {
                        get: {method: 'JSONP'}
                    }
                );
            }
        };
    }])

    .factory('Venue', ['$resource', function($resource){        
        return {            
            query: function (id) {
                var url = 'https://api.foursquare.com/v2/venues/'+id;
                return $resource(url, 
                    {
                        client_id: requestParms.clientId,
                        client_secret: requestParms.clientSecret,
                        v: requestParms.version,
                        callback: 'JSON_CALLBACK'
                    }, {
                        get: {method: 'JSONP'}
                    }
                );
            }
        };        
    }])

    /**
     * Deal with HTML5 localStorage
     * @return {[object]}
     */
    .factory('localStorageService', function () {
        return {

            /**
             * Merge object in localStorage with created one (adds properties)
             * @param  {[string]} key [existing localstorage key]
             * @param  {[object]} obj [new object]
             * @return {[object]}     [merged object]
             */
            mergeLocalStorage: function(key, obj){
                var newObj = JSON.parse(localStorage.getItem(key)), prop;
                for (prop in obj){
                    newObj[prop] = obj[prop];
                }
                localStorage.setItem(key, JSON.stringify(newObj));
                return newObj;
            },

            /**
             * Get property of object that is in localstorage
             * @param  {[string]} obj  [object name]
             * @param  {[string]} prop [property name]
             * @return {[]}      [property value]
             */
            getObjectProperty : function (obj, prop) {
                var parsedObj = JSON.parse(localStorage[obj]);
                return parsedObj[prop];
            },

            getObject : function (obj) {
                if (localStorage[obj]) {
                    var parsedObj = JSON.parse(localStorage[obj]);
                    return parsedObj;
                } else {
                    return {};
                }               
            },

            setObject: function (lsProp, data) {
                var a = [];
                if (!localStorage[lsProp]) {
                    a.push(data);
                    localStorage.setItem(lsProp, JSON.stringify(a));
                } else {                    
                    a = JSON.parse(localStorage.getItem(lsProp));
                    for (var i = 0; i < a.length; i++) {
                        if (a[i]['id'] === data.id) {
                            return false;
                        }
                    };
                    a.push(data);
                    localStorage.setItem(lsProp, JSON.stringify(a));
                    return true;
                }
                
            }
        }
    })

    /**
     * An angular.js wrapper around window.navigator.geolocation
     * https://github.com/arunisrael/angularjs-geolocation
     */
    .constant('geolocation_msgs', {
            'errors.location.unsupportedBrowser':'Browser does not support location services',
            'errors.location.permissionDenied':'You have rejected access to your location',
            'errors.location.positionUnavailable':'Unable to determine your location',
            'errors.location.timeout':'Service timeout has been reached'
    })

    .factory('geolocation', ['$q', '$rootScope', '$window', 'geolocation_msgs', function ($q,$rootScope,$window,geolocation_msgs) {
        return {
          getLocation: function (opts) {
            var deferred = $q.defer();
            if ($window.navigator && $window.navigator.geolocation) {
              $window.navigator.geolocation.getCurrentPosition(function(position){
                $rootScope.$apply(function(){deferred.resolve(position);});
              }, function(error) {
                switch (error.code) {
                  case 1:
                    $rootScope.$broadcast('error',geolocation_msgs['errors.location.permissionDenied']);
                    $rootScope.$apply(function() {
                      deferred.reject(geolocation_msgs['errors.location.permissionDenied']);
                    });
                    break;
                  case 2:
                    $rootScope.$broadcast('error',geolocation_msgs['errors.location.positionUnavailable']);
                    $rootScope.$apply(function() {
                      deferred.reject(geolocation_msgs['errors.location.positionUnavailable']);
                    });
                    break;
                  case 3:
                    $rootScope.$broadcast('error',geolocation_msgs['errors.location.timeout']);
                    $rootScope.$apply(function() {
                      deferred.reject(geolocation_msgs['errors.location.timeout']);
                    });
                    break;
                }
              }, opts);
            }
            else
            {
              $rootScope.$broadcast('error',geolocation_msgs['errors.location.unsupportedBrowser']);
              $rootScope.$apply(function(){deferred.reject(geolocation_msgs['errors.location.unsupportedBrowser']);});
            }
            return deferred.promise;
          }
        };
    }])

    .factory('googleMaps', ['$rootScope', 'toaster', function ($rootScope, toaster) {
        return {
            init: function (lat, lng, elem, doSetHeight, doAddUserMarker){
                this.lat = lat;
                this.lng = lng;

                if (doSetHeight) {
                    this.setHeight(elem);
                }

                var options = {
                    zoom: 15,
                    center: new google.maps.LatLng(lat, lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: true
                };
                this.map = new google.maps.Map(document.getElementById(elem), options);

                if (doAddUserMarker) {
                    this.addUserMarker();                    
                }

                return this.map;
            },

            addUserMarker: function () {
                var that = this;
                var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Я|69D3BF");

                var marker = new google.maps.Marker({
                    map: this.map,
                    draggable: true,
                    position: new google.maps.LatLng(that.lat, that.lng),
                    icon: pinImage
                });

                var infowindow = new google.maps.InfoWindow({
                    content: "Вы здесь?<br>Если нет, передвиньте метку."
                });

                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(this.map, marker);
                });

                google.maps.event.addListener(marker, 'dragend', function(e) {
                    $rootScope.lat = e.latLng.lat();
                    $rootScope.lng = e.latLng.lng();
                    $rootScope.$apply();
                    infowindow.close(this.map, marker);
                    // toaster.pop('success', "Спасибо!", "Ваше местоположение сохранено.");
                    if (!$rootScope.loadVenuesButton) {
                        $rootScope.loadVenuesButton = !$rootScope.loadVenuesButton;
                        $rootScope.$apply();
                    }                    
                });
            },

            addVenueMarker: function () {
                var that = this;
                var marker = new google.maps.Marker({
                    map: this.map,                    
                    position: new google.maps.LatLng(that.lat, that.lng)
                });

            },

            setHeight: function (elem) {
                var map = document.getElementById(elem),
                    menuHeight = document.getElementById('menu').offsetHeight,
                    windowHeight = window.innerHeight;

                map.style.height = windowHeight - menuHeight + 'px';
            },

            addVenueMarkers: function (venues) {
                var that = this,                    
                    infoWindow = new google.maps.InfoWindow();

                this.markers = [];

                var createMarker = function (info){
                    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld="+info.ind+"|BAC4C5");
                    var marker = new google.maps.Marker({
                        map: that.map,
                        position: new google.maps.LatLng(info.location.lat, info.location.lng),
                        title: info.name,
                        icon: pinImage
                    });
                    marker.content = '<div class="infoWindowContent">' + (info.location.address || '') + '</div>';
                    
                    google.maps.event.addListener(marker, 'click', function(){
                        infoWindow.setContent('<h5>' + marker.title + '</h5>' + marker.content + '<a href="#/venue/'+info.id+'">Подробнее</a>');
                        infoWindow.open(that.map, marker);
                    });
                    
                    that.markers.push(marker);
                    
                }

                for (var i = 0; i < venues.length; i++){
                    venues[i]['ind'] = i+1; 
                    createMarker(venues[i]);
                }
            },

            openInfoWindow: function(venue){
                var that = this;
                google.maps.event.trigger(that.markers[venue.ind-1], 'click');
            }

        };
    }])