(function () {
    
    var voucherRedeemApp = angular.module('voucherGenerateApp', ['ngRoute', 'voucherServiceModule'])
     .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
    
    voucherRedeemApp.controller('VoucherGenerateCtrl', function ($scope, $location, $timeout, voucherService) {
        var voucherNo = $location.search().vn;
        
        $scope.onImageLoaded = function () { 
            if ($scope.voucher && (typeof window.callPhantom == 'function'))
                window.callPhantom();
        };

        voucherService.find(voucherNo, function (err, data) {
            if (err)
                return $scope.errorMessage = err;
            
            $scope.voucher = data.voucher;
        });
    });

    voucherRedeemApp.directive('imageonload', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('load', function () {
                    //call the function that was passed
                    scope.$apply(attrs.imageonload);
                });
            }
        };
    });

})();