var orderController = require('../controllers/order');

exports.routeOrderRequests = function (app, passportConf) {
    
    app.post('/order/create', orderController.create);
    
    app.get('/order/info', orderController.info);

};