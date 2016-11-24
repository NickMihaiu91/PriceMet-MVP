(function () {
    var offerDetailsApp = angular.module('offerDetailsApp', ['offersServiceModule', 'yelpServiceModule', 'GoogleMapsNative', 'OuiBounceModalApp']);

    offerDetailsApp.controller('OfferDetailsCtrl', function ($scope, $rootScope, $timeout, offersService) {
        $scope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
        
        $scope.mapOptions = { zoom: 16 };
        $scope.mapAddress = { address: 'Vancouver, Canada' };

        $timeout(function () { 
            var offerId = getParameterByName('id'),
                noOfPersons = getParameterByName('n');
            
            $scope.noOfPersons = noOfPersons;

            offersService.getOfferById(offerId, noOfPersons, function (offer) {
                $scope.offer = offer;
                $scope.safeApply();
                setSocialSharingInfo(offer);                
                $scope.mapAddress = { address: offer.merchantAddress };

                setDynamicMetaTags(offer, $rootScope);
                mixpanel.track("Page viewed");
            });
        }, 300);

        $scope.acceptBid = function (offerId) { 
            mixpanel.track("Accept bid details page", { offerId: offerId });
        };

        $scope.closePageFeedbackOption = ["I like your site, but I am not in the mood to buy awesome food right now",
            "Your offers are too pricey for me",
            "I don't like the food you offer",
            "I don't like the restaurant",
            "I couldn't find any restaurant near me",
            "I don't trust your website",
            "I don't see any value for me in using your website"];
    });
    
    offerDetailsApp.controller('YelpReviewCtrl', function ($scope, yelpService) {
        var unregisterOfferWatch = $scope.$watch('offer', function () {
            if ($scope.offer) {
                var merchantYelpId = $scope.offer.merchantOnlineInfo.yelpId;

                yelpService.business(merchantYelpId, function (err, data) {
                    if (err)
                        return console.error(err);
                    
                    $scope.yelpUrl = data.url;
                    $scope.yelpReview = data.reviews[0];
                });

                unregisterOfferWatch();
            }
        });
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function setSocialSharingInfo(offer) {
        var options = {
            url: window.location.href,
            image: 'http://pricemet.ca/' + offer.imgUrl,
            description: offer.bidOfferTitle + ' only on www.pricemet.ca',
            twitterHandler: '@PriceMet_'
        };
        
        $.fn.rrssb(options);
    }

    function setDynamicMetaTags(offer, $rootScope) {
        $rootScope.metatags = {};
        $rootScope.metatags.fb_url = window.location.href;
        $rootScope.metatags.fb_title = offer.bidOfferTitle;
        $rootScope.metatags.fb_description = offer.description;
        $rootScope.metatags.fb_image = 'www.pricemet.ca/' + offer.imgUrl;
    }
})();