(function () {
    
    var thankYouApp = angular.module('thankYouApp', ['ngRoute', 'orderServiceModule'])
     .config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });
    
    thankYouApp.controller('ShareOfferCtrl', function ($scope, $location, orderService) {
        var orderId = $location.search().orid;
        
        orderService.getOrderInfo(orderId, function(err, order){
            console.log(err);
            $scope.order = order;
            setSocialSharingInfo(order);
        });
    });

    function setSocialSharingInfo(order) {
        var options = {
            title: 'Title',
            name: 'Name',
            url: 'www.pricemet.ca',
            image: 'http://pricemet.ca/' + order.offer.imgUrl,
            description: order.offer.title + ' only on www.pricemet.ca',
            twitterHandler: '@PriceMet_'
        };

        $.fn.rrssb(options);
    };

})();