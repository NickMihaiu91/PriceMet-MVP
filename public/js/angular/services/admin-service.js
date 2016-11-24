'use strict';

(function () {
    
    angular.module('adminServiceModule', [])
        .factory('adminService', function ($http) {
        
        return {
            createMerchant : function (merchant, callback) {
                var url = "node/user/createMerchant";
                
                $http.post(url, { merchant: merchant })
                    .success(function (data) {
                    callback();
                })
                    .error(function (data, status, headers, config) {
                    callback(data.errorMessage);
                });
            }
        };

    });

})();