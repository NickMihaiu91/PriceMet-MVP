'use strict';

(function () {
    
    angular.module('yelpServiceModule', [])
        .factory('yelpService', function ($http) {
        
        return {
            business : function (businessId, callback) {
                var url = "node/api/yelp/business",
                    params = {
                        params: { businessId: businessId }
                    };
                
                $http.get(url, params)
                    .success(function (data) {
                    callback(null, data);
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            }
        };

    });

})();