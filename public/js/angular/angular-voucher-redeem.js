(function () {
    
    var voucherRedeemApp = angular.module('voucherRedeemApp', ['ngRoute', 'voucherServiceModule'])
     .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
    
    voucherRedeemApp.controller('VoucherRedeemCtrl', function ($scope, $location, voucherService) {
        var voucherNo = $location.search().vn;
        
        voucherService.find(voucherNo, function (err, data) {
            if (err)
                return $scope.errorMessage = err;
            
            $scope.voucher = data.voucher;
        });
        
        $scope.redeem = function () {
            
            swal({
                title: 'Are you sure?', 
                text: "Once redeemed the voucher can't be used again.", 
                type: 'warning', 
                showCancelButton: true, 
                confirmButtonColor: '#65AF68', 
                cancelButtonColor: '#d33', 
                confirmButtonText: 'Yes, redeem!', 
                closeOnConfirm: false
            }, 
                function () {
                voucherService.redeem(voucherNo, function (err) {
                    if (err)
                        return swal('Error!', err, 'error');

                    swal('Redeemed!', 'The voucher has been redeemed succesfully.', 'success');
                });
            });
            
        };
    });

})();