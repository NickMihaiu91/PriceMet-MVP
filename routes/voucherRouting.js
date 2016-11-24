var voucherController = require('../controllers/voucher');

exports.routeVoucherRequests = function (app, passportConf) { 

    app.post('/voucher/isValid', voucherController.isValid);

    app.post('/voucher/redeem', voucherController.redeem);

    app.get('/voucher/find', voucherController.find);
};