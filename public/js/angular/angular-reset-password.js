(function () {
    
    var resetPasswordApp = angular.module('ResetPasswordApp', ['ngRoute', 'authServiceModule'])
    .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
    
    resetPasswordApp.controller('ResetPasswordCtrl', function ($scope, $location, authService) {
        
        $scope.resetPassword = function () {
            var credentials = {
                password: $scope.password,
                confirm: $scope.confirmPassword,
                token: $location.search().token
            };
            
            $scope.passwordForm.submitted = true;
            $scope.errorMessage = '';
            $scope.successMessage = '';
            
            if ($scope.password !== $scope.confirmPassword)
                return $scope.errorMessage = 'Passwords do not match. Please make sure they are the same.';
            
            if ($scope.passwordForm.$valid)
                authService.resetPassword(credentials, function (error, message) {
                    $scope.errorMessage = error;
                    $scope.successMessage = message;
                });
        };
    });

})();