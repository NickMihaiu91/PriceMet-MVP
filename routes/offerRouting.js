var offerController = require('../controllers/offer');

exports.routeOfferRequests = function (app, passportConf) {
    
    app.get('/offer/get', offerController.get);

    app.get('/offer/getRange', offerController.getRange);

};