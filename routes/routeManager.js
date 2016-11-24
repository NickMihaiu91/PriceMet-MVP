var userRouting = require('./userRouting'),
    voucherRouting = require('./voucherRouting'),
    orderRouting = require('./orderRouting'),
    offerRouting = require('./offerRouting'),
    yelpApiRouting = require('./yelpApiRouting');

exports.createRoutes = function (app, passport, passportConf) {
    
    userRouting.routeUserRequests(app, passport, passportConf);
    
    voucherRouting.routeVoucherRequests(app, passportConf);
    
    orderRouting.routeOrderRequests(app, passportConf);
    
    offerRouting.routeOfferRequests(app, passportConf);
    
    yelpApiRouting.routeYelpRequest(app, passportConf);
    
    app.use(function (err, req, res, next) {
        // only handle `next(err)` calls
        res.status(err.status || 400).send({ errorMessage: err.message || "An error has occured" });
    });
}