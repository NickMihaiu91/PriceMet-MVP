'use strict';

(function () {
    
    angular.module('orderServiceModule', [])
        .factory('orderService', function ($http) {
        
        return {
            createOrder : function (orderData, callback) {
                var url = "node/order/create";
                
                $http.post(url, orderData)
                    .success(function (data) {
                    callback(null, data);
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            },
            getOrderInfo: function (orderId, callback) { 
                var url = "node/order/info",
                    params = {
                        params: { orderId: orderId }
                    };
                
                $http.get(url, params)
                    .success(function (data) {
                    callback(null, data.order);
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            }
        };
    });

})();