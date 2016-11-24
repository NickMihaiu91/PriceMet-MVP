'use strict';

(function () {
    
    angular.module('authServiceModule', [])
        .factory('authService', function ($http) {
        
        return {
            isLoggedIn : function (callback) {
                var url = "node/user/isUserAuthenticated";
                
                $http.get(url)
                    .success(function (data, status) {
                    callback();
                })
                    .error(function (data, status) {
                    callback(data, status);
                });
            },
            isMerchantLoggedIn : function (callback) { 
                var url = "node/user/isMerchantAuthenticated";
                
                $http.get(url)
                    .success(function (data, status) {
                    callback();
                })
                    .error(function (data, status) {
                    callback(data, status);
                });
            },
            login : function (credentials, callback) {
                var url = 'node/user/login';
                
                $http.post(url, credentials)
                    .success(function () {
                    callback();
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            },
            logout : function (callback) { 
                var url = 'node/user/logout';
                
                $http.get(url)
                    .success(function () {
                    callback();
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            },
            forgotPassword : function (email, callback) { 
                var url = 'node/user/forgot';
                
                $http.post(url, email)
                    .success(function (data) {
                    callback(null, data.message);
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            },
            resetPassword : function (credentials, callback) { 
                var url = 'node/user/reset';
                
                $http.post(url, credentials)
                    .success(function (data) {
                    callback(null, data.message);
                })
                    .error(function (data) {
                    callback(data.errorMessage);
                });
            }
        };

    });

})();