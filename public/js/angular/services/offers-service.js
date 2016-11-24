'use strict';

(function () {
    var locationService,
        cachedCalculatedDistances = [];
    
    angular.module('offersServiceModule', [])
        .factory('offersService', function ($http, $timeout) {
        
        var offers = [],
            INITIAL_WAIT_INTERVAL = 0,
            MAX_WAIT_INTERVAL = 20,
            MIN_WAIT_INTERVAL = 10,
            INCREASE_WAIT_INTERVAL_AFTER_NO_OF_OFFERS = 6,
            MAX_OFFER_VALUE = 50,
            maxWaitInterval,
            minWaitInterval,
            storedValues = {},
            showMoreOffersTimer,
            initialOfferTimer;
        
        var getOffers = function (budget, noOfPersons, location, offerType, callback) {
            var url = "node/offer/getRange",
                params = {
                    params: {
                        budget: budget,
                        noOfPersons: noOfPersons
                    }
                };
            
            $http.get(url, params)
                            .success(function (offers) {
                formatOffers(offers, noOfPersons, location, true, function (formatedOffers) {
                    callback(formatedOffers);
                });
            })
                            .error(function (data) {
                callback(data.errorMessage);
            });
        };
        
        var addOffer = function (offer) {
            if (offer)
                offers.push(offer);
        };
        
        var initializeFlow = function () {
            var showMoreOffersAtInterval = function () {
                if (storedValues.limitTo >= offers.length)
                    return;
                
                if (storedValues.limitTo === INCREASE_WAIT_INTERVAL_AFTER_NO_OF_OFFERS) {
                    minWaitInterval *= 3;
                    maxWaitInterval *= 3;
                }
                
                var waitTime = randomIntFromInterval(minWaitInterval, maxWaitInterval);
                showMoreOffersTimer = $timeout(function () {
                    storedValues.limitTo++;
                    showMoreOffersAtInterval();
                }, waitTime * 1000);
            };
            
            minWaitInterval = MIN_WAIT_INTERVAL;
            maxWaitInterval = MAX_WAIT_INTERVAL;
            storedValues.limitTo = 5;
            
            if (initialOfferTimer)
                $timeout.cancel(initialOfferTimer);
            
            if (showMoreOffersTimer)
                $timeout.cancel(showMoreOffersTimer);
            
            initialOfferTimer = $timeout(function () {
                if (!offers.length)
                    return;
                
                storedValues.limitTo++;
                showMoreOffersAtInterval();
            }, INITIAL_WAIT_INTERVAL * 1000);
        };
        
        var stopShowingMoreOffers = function () {
            $timeout.cancel(showMoreOffersTimer);
        };
        
        var getOfferById = function (id, noOfPersons, callback) {
            var url = "node/offer/get",
                params = {
                    params: { offerId: id }
                };
            
            $http.get(url, params)
                        .success(function (offer) {
                formatOffers([offer], noOfPersons, null, false, function (formatedOffers) {
                    callback(formatedOffers[0]);
                });
            })
                        .error(function (data) {
                callback(data.errorMessage);
            });
        };
        
        var service = {
            getOffers: getOffers,
            addOffer: addOffer,
            getOfferById: getOfferById,
            stopShowingMoreOffers: stopShowingMoreOffers,
            storedValues: storedValues
        };
        
        return service;
    });
    
    
    function formatOffers(parseOfferList, noOfPersons, location, getDistance, callback) {
        var offers = [],
            RATING_MIN = 3,
            RATING_MAX = 5,
            VOTES_MIN = 50,
            VOTES_MAX = 200,
            counter = 0;
        
        angular.forEach(parseOfferList, function (value, index) {
            offers.push({
                id: value._id,
                bidOfferTitle: formatBidOfferTitle(value.title, value.price, value.originalPrice, noOfPersons),
                description: value.description,
                offerPrice: Math.round(value.price * noOfPersons * 10) / 10,
                originalPrice: Math.round(value.originalPrice * noOfPersons * 10) / 10,
                imgUrl: value.imgUrl,
                merchantName: value.merchant.merchantProfile.business.name,
                merchantAddress: formatMerchantAddress(value.merchant.merchantProfile.business),
                merchantInfo: value.merchant.merchantProfile.business,
                merchantOnlineInfo: value.merchant.merchantProfile.online,
                rating: randomIntFromInterval(RATING_MIN, RATING_MAX),
                votes: randomIntFromInterval(VOTES_MIN, VOTES_MAX)
            });
            
            if (getDistance)
                getDistanceBetweenTwoLocations(location, formatMerchantAddress(value.merchant.merchantProfile.business), index, function (err, distance, index) {
                    if (err)
                        return callback(offers);
                    
                    counter++;
                    distance = distance.replace(',', '.');
                    offers[index].distance = parseFloat(distance);
                    
                    if (counter === offers.length)
                        return callback(offers);
                });
            else
                callback(offers);
        });
    }
    
    function formatBidOfferTitle(bidOfferTitle, offerPrice, originalPrice, noOfPersons) {
        if (noOfPersons == 1)
            return bidOfferTitle;
        
        var offerPriceRegex = new RegExp('[$]' + offerPrice + '((?:\s)|(?:\:)|[^0-9])'),
            offerTitleEnding = ' - for each person';
        
        bidOfferTitle = bidOfferTitle.replace(originalPrice, originalPrice * noOfPersons);
        bidOfferTitle = bidOfferTitle.replace(offerPriceRegex, '*' + offerPrice * noOfPersons + '#');
        bidOfferTitle = bidOfferTitle.replace('*', '$');
        bidOfferTitle = bidOfferTitle.replace('#', ' ');
        
        return bidOfferTitle + offerTitleEnding; // + formatNoOfPersonsToTextRepresentation(noOfPersons);
    }
    
    function formatMerchantAddress(merchant) {
        if (!merchant)
            return '';
        
        return merchant.address + ', ' + merchant.city + ', ' + 'BC';
    }
    
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    
    function formatNoOfPersonsToTextRepresentation(noOfPersons) {
        var textValues = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
        return textValues[noOfPersons];
    }
    
    function getDistanceBetweenTwoLocations(source, destination, index, callback) {
        
        if (!locationService)
            locationService = new google.maps.DistanceMatrixService();
        
        for (var i = 0; i < cachedCalculatedDistances.length; i++) {
            if (cachedCalculatedDistances[i].source == source && cachedCalculatedDistances[i].destination == destination)
                return callback(null, cachedCalculatedDistances[i].distance, index);
        }
        
        locationService.getDistanceMatrix(
            {
                origins: [source],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING
            }, function (response, status) {
                if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].distance) {
                    cachedCalculatedDistances.push({
                        source: source,
                        destination: destination,
                        distance: response.rows[0].elements[0].distance.text
                    });
                    return callback(null, response.rows[0].elements[0].distance.text, index);
                }

                callback('Error in getting distance.');
            }
        );
    }
    
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        
        return array;
    }
})();