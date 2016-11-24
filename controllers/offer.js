var Offer = require('../models/Offer'),
    User = require('../models/User'),
    async = require('async');


/**
 * GET /offer/getRange
 * params: budget, noOfPersons
 */
exports.getRange = function (req, res, next) {
    req.assert('budget', 'Budgest is needed').notEmpty().isInt();
    req.assert('noOfPersons', 'Number of persons is needed').notEmpty().isInt();
    
    var errors = req.validationErrors(),
        MAX_BUDGET_MARGIN = 3,
        NO_OF_CLOSEST_OFFERS = 10,
        counter = 0,
        merchantIds = {},
        merchantProfiles = {},
        budgetPerPerson,
        minLimit,
        maxLimit;
    
    if (errors)
        return next({ message: errors[0].msg });
    
    budgetPerPerson = Math.floor(req.query.budget / req.query.noOfPersons);
    minLimit = budgetPerPerson - MAX_BUDGET_MARGIN;
    maxLimit = budgetPerPerson + MAX_BUDGET_MARGIN;

    async.waterfall([
        function (done) { 
            // get offers in range
            Offer.find({ price: { $gte: minLimit, $lte: maxLimit } }, function (err, offers) { 
                done(err, offers);
            });
        },
        function (offers, done) { 
            if (offers && offers.length)
                return done(null, offers);

            // else get the offer closest to that budget
            Offer.find({ price: { $lte: budgetPerPerson } }).sort({ price: -1 }).limit(NO_OF_CLOSEST_OFFERS).exec(function (err, closestOffersBelow) {
                if (err)
                    return done(err);
                
                Offer.find({ price: { $gt: budgetPerPerson } }).sort({ price: 1 }).limit(NO_OF_CLOSEST_OFFERS).exec(function (err, closestOffersAbove) { 
                    if (err)
                        return done(err);

                    var closestOffers = closestOffersBelow.concat(closestOffersAbove);

                    done(err, closestOffers);
                });
            });
        },
        function (offers, done) {

            for (var i = 0; i < offers.length; i++)
                merchantIds[offers[i].merchantId.toString()] = true;
            
            for (var merchantId in merchantIds) {
                User.findById(merchantId, 'merchantProfile.business merchantProfile.online merchantProfile.isValid', function (err, merchant) {
                    if (err)
                        return done(err);
                    
                    merchantProfiles[merchant._id.toString()] = merchant;
                    counter++;
                    
                    if (counter == Object.keys(merchantIds).length) {
                        for (var i = 0; i < offers.length; i++)
                            offers[i]._doc.merchant = merchantProfiles[offers[i]._doc.merchantId.toString()];
                        
                        done(null, offers);
                    }
                });
            }
        },
        //function (offers, done) { 
        //    // filter offers & only send valid offers
        //    var filteredOffers = [];

        //    for (var i = 0; i < offers.length; i++)
        //        if (offers[i]._doc.merchant.merchantProfile.isValid)
        //            filteredOffers.push(offers[i]);

        //    done(null, filteredOffers);
        //}
    ], function (err, offers) {
        if (err)
            return next(err);

        res.status(200).send(offers);
    });

};

/**
 * GET /offer/get
 * params: offerId
 */
exports.get = function (req, res, next) {
    req.assert('offerId', 'Offer id is needed').notEmpty();

    var errors = req.validationErrors();

    if (errors)
        return next({ message: errors[0].msg });

    Offer.findById(req.query.offerId, function (err, offer) {
        if (err)
            return next(err);
        
        if (!offer)
            return next({ message: 'No offer found' });

        User.findById(offer.merchantId, 'merchantProfile.business merchantProfile.online', function (err, merchant) {
            if (err)
                return next(err);

            offer._doc.merchant = merchant;
            
            res.status(200).send(offer);
        });
    
    });
};