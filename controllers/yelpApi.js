var secrets = require('../config/secrets'),
    Yelp = require('yelp');

var yelp = new Yelp({
    consumer_key: secrets.yelp.consumer_key,
    consumer_secret: secrets.yelp.consumer_secret,
    token: secrets.yelp.token,
    token_secret: secrets.yelp.token_secret
});

/**
 * GET /api/yelp/business
 */
exports.business = function (req, res, next) {
    yelp.business(req.query.businessId)
  .then(function (business) {
        res.status(200).send(business);
    })
  .catch(function (err) {
        console.log('Yelp api error', err);
        next(err);
    });
};