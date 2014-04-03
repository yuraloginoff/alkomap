'use strict';

/* Filters */

angular.module('Alkomap.filters', [])
    /**
     * Default Angular seed filter
     */
    .filter('interpolate', ['version', function(version) {
        return function(text) {
            return String(text).replace(/\%VERSION\%/mg, version);
        }
    }])

    /**
     * Make clean categories array
     * @return {[array]} [Array of objects]
     */
    .filter('categoriesFilter', function () {        
        return function (categories, nightlifeVenuesId) {
            var ret = [];
            for (var i = 0; i < categories.length; i++) {
                if (categories[i]['id'] === nightlifeVenuesId) {
                    for (var j = 0; j < categories[i]['categories'].length; j++) {
                        ret[ret.length] = {
                            id: categories[i]['categories'][j]['id'],
                            pluralName: categories[i]['categories'][j]['pluralName']
                        };
                    };
                }
            };
            return ret;         
        };
    })