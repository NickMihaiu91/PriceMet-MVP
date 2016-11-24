'use strict';

(function () {
    
    angular.module('voucherServiceModule', [])
        .factory('voucherService', function ($http) {
        
        return {
            isValid : function (voucherNo, callback) {
                var url = "node/voucher/isValid";
                
                $http.post(url, { voucherNo: voucherNo })
                    .success(function (data) {
                    callback();
                })
                    .error(function (data, status, headers, config) {
                    callback(data.errorMessage);
                });
            },
            
            find : function (voucherNo, callback) {
                var url = "node/voucher/find",
                    params = {
                        params: { voucherNo: voucherNo }
                    };
                
                $http.get(url, params)
                    .success(function (data) {
                    callback(null, data);
                })
                    .error(function (data, status, headers, config) {
                    callback(data.errorMessage);
                });
            },
            
            redeem : function (voucherNo, callback) {
                var url = "node/voucher/redeem";
                
                $http.post(url, { voucherNo: voucherNo })
                    .success(function (data) {
                    callback(null, data);
                })
                    .error(function (data, status, headers, config) {
                    callback(data.errorMessage);
                });
            },
        };

    });

})();