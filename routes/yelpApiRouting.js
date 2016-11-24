var yelpApi = require('../controllers/yelpApi');

exports.routeYelpRequest = function (app, passportConf) {
    
    app.get('/api/yelp/business', yelpApi.business);
};