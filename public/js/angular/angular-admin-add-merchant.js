(function () {
    
    var addMerchantApp = angular.module('addMerchantApp', ['authServiceModule', 'adminServiceModule'])
    .run(['authService', function (authService) {
            authService.isLoggedIn(function (err) {
                if (err)
                    return window.location.assign('/admin-login');
            });
        }]);
    
    addMerchantApp.controller('FormCtrl', function ($scope, adminService) {
        
        $scope.createMerchant = function () {
            $scope.merchantCreateForm.submitted = true;
            $scope.serverMessage = '';
            
            if ($scope.merchantCreateForm.$valid)
                adminService.createMerchant($scope.merchant, function (errorMessage) { 
                    if (errorMessage)
                        return $scope.serverMessage = errorMessage;

                    $scope.serverMessage = 'Succesfully created merchant account.';
                });
        };
        
    });
})();