(function () {

    var loginApp = angular.module('loginApp', ['authServiceModule'])
    .run(['authService', function (authService) {
            authService.isLoggedIn(function (err) {
                if (!err)
                    return window.location.assign('/admin-options');
                
                console.log(err);
            });
        }]);

    loginApp.controller('LoginCtrl', function ($scope, authService) { 
        
        $scope.login = function () {
            var credentials = {
                email: $scope.email,
                password: $scope.password
            };
            
            $scope.errorMessage = '';

            authService.login(credentials, function (error) {
                if (!error)
                    return window.location.assign('/admin-options');

                $scope.errorMessage = error;
            });
        };
    });

})();