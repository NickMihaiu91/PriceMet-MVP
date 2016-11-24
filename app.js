/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');

var pdf = require('./controllers/pdf.js');

/**
 * Route manager (route handlers).
 */
var routeManager = require('./routes/routeManager');

/**
 * User model
 */
var User = require('./models/User');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function () {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

/**
 * Express configuration.
 */
//app.set('port', process.env.PORT || 3000);
app.set('port', 1337); // remove this in production

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secrets.sessionSecret,
    store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
    csrf: false,
    xframe: 'SAMEORIGIN',
    xssProtection: true
}));
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});
app.use(function (req, res, next) {
    if (/api/i.test(req.path)) req.session.returnTo = req.path;
    next();
});


/**
 * Routes
 */
 routeManager.createRoutes(app, passport, passportConf);


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
    
    addAdminUser();
    //addTestVoucher();
    //addTestOffer();

    pdf.initializePhantomSession(function () { 
        console.log('Initialized phantom js session.');
    });
});

module.exports = app;


function addAdminUser() {
    var adminEmail = 'office@pricemet.ca',
        adminUser = new User({
            email: adminEmail,
            password: secrets.adminUserPassword,
            role: 'admin'
        });
    
    User.findOne({ email: adminEmail }, function (err, existingUser) {
        if (existingUser)
            return console.log('Admin user already created');

        adminUser.save(function (err) {
            if (err) console.log('Error', err);
            console.log('Created admin user account.');
        });
    });
};

function addTestVoucher() {
    var voucher = {
        offerId: mongoose.Types.ObjectId(),
        offerImageUrl: 'images/offers/restaurant/R19.jpg',
        offerTitle: 'Rib Crib Barbecue for Lunch',
        merchantName: 'The Keg Steakhouse & Bar',
        totalPrice: 24,
        unitaryPrice: 8,
        noOfPersons: 3,
        buyerName: 'Sorin Silivestru',
        buyerAddress: 'Parker Street, Vancouver',
        buyerEmail: 'sorin@pricemet.ca',
        expiresAt: new Date(new Date().setYear(2016)),
    };

    var voucherCtrl = require('./controllers/voucher');

    voucherCtrl.create(voucher, function (err) { 
        if (err)
            return console.log(err);

        console.log('Test voucher created succesfully.');
    });
};

function addTestOffer() {
    var offer = {
        title: 'C$10 for C$20 worth toward Japanese Cuisine During Dinner',
        description: 'Extraordinary Japanese Cuisine During Dinner Description',
        category: 'Sushi dinner',
        price: 10,
        originalPrice: 20,
        minPrice: 5,
        ipps: [7], // intermediate pricing points
        imgUrl: 'images/offers/restaurant/R12.jpg',
        merchantId: mongoose.Types.ObjectId('5638f58bf53507f8198bea3d'),
        expiresAt: new Date()
    };

    var Offer = require('./models/Offer');

    var offerDB = new Offer(offer);

    offerDB.save(function (err) {
        if (err) console.log('Error', err);
        console.log('Created test offer.');
    });
};
