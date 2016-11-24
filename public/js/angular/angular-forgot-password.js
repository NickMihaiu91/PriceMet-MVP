(function () {
    
    var resetPasswordApp = angular.module('ForgotPasswordApp', ['authServiceModule']);

    resetPasswordApp.controller('ResetPasswordCtrl', function ($scope, authService) {
        
        $scope.resetPassword = function () {
            var credentials = {
                email: $scope.email
            };
            
            $scope.emailForm.submitted = true;
            $scope.errorMessage = '';
            $scope.successMessage = '';
            
            if ($scope.emailForm.$valid)
                authService.forgotPassword(credentials, function (error, message) {
                    $scope.errorMessage = error;
                    $scope.successMessage = message;
                });
        };
    });

})();