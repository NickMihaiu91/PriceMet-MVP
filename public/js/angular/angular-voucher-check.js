(function () {
    
    var voucherCheckApp = angular.module('voucherCheckApp', ['voucherServiceModule']);
    
    voucherCheckApp.controller('VoucherCheckCtrl', function ($scope, $timeout, voucherService) {
        
        $scope.checkVoucherNo = function () {
            var voucherNo = $scope.voucherNo;

            $scope.voucherNoForm.submitted = true;
            $scope.errorMessage = '';
            $scope.successMessage = '';
            
            if ($scope.voucherNoForm.$valid)
                voucherService.isValid(voucherNo, function (error) {
                    if(error)
                        return $scope.errorMessage = error;

                    $scope.successMessage = "Valid voucher. You'll be redirected to redeem the voucher.";

                    $timeout(function () { 
                        window.location.assign('/voucher-redeem?vn=' + voucherNo);
                    }, 1500);
                });
        };
    });

})();