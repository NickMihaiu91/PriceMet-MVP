(function () {
    
    var merchantDashboardApp = angular.module('merchantDashboardApp', ['authServiceModule'])
    .run(['authService', function (authService) {
            authService.isMerchantLoggedIn(function (err) {
                if (err)
                    return window.location.assign('/merchant-login');
                
                console.log(err);
            });
        }]);
    
    merchantDashboardApp.controller('DashboardCtrl', function ($scope) {
        $scope.offers =
                [{
                name: 'Rib Crib Barbecue for Lunch',
                url: 'images/offers/restaurant/R19.jpg',
                currentPrice: 8,
                voucherSold: 40,
                voucherRedeemed: 27,
                pays: [{
                        quantity: 5,
                        price: 10,
                        total: 50
                    }, 
                        {
                        quantity: 22,
                        price: 8,
                        total: 176
                    }
                ]
            }, 
            {
                name: 'Upscale Canadian Cuisine:  wine-and-dine prix-fixe dinner',
                url: 'images/offers/restaurant/R57.jpg',
                currentPrice: 30,
                voucherSold: 20,
                voucherRedeemed: 14,
                pays: [{
                        quantity: 7,
                        price: 32,
                        total: 224
                    }, 
                        {
                        quantity: 7,
                        price: 31,
                        total: 217
                    }
                ]
            }];
        
        $scope.total = 667;

        $scope.getSubtotalForPays = function (offerIndex) {
            if (offerIndex < 0)
                return 0;
            
            var total = 0;
            for (var i = 0; i < $scope.offers[offerIndex].pays.length; i++)
                total += $scope.offers[offerIndex].pays[i].total;

            return total;
        };
        
    });

    merchantDashboardApp.controller('NavbarCtrl', function ($scope, authService) {
        $scope.logout = function () {
            authService.logout(function (err) { 
                if (!err)
                    window.location.assign('/merchant-login');
            });
        };
    });

})();