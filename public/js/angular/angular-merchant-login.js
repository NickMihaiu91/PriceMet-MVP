(function () {
    
    var loginApp = angular.module('loginApp', ['authServiceModule'])
    .run(['authService', function (authService) {
            authService.isMerchantLoggedIn(function (err) {
                if (!err)
                    return window.location.assign('/merchant-dashboard');
                
                console.log(err);
            });
        }]);
    
    loginApp.controller('LoginCtrl', function ($scope, authService) {
        
        $scope.login = function () {
            var credentials = {
                email: $scope.email,
                password: $scope.password
            };
            
            $scope.loginForm.submitted = true;
            $scope.errorMessage = '';
            
            if ($scope.loginForm.$valid)
                authService.login(credentials, function (error) {
                    if (!error)
                        return window.location.assign('/merchant-dashboard');
                
                    $scope.errorMessage = error;
                });
        };
    });

})();