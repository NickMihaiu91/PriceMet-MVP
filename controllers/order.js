var Voucher = require('../models/Voucher'),
    Order = require('../models/Order'),
    Offer = require('../models/Offer'),
    User = require('../models/User'),
    voucherCtrl = require('../controllers/voucher'),
    async = require('async'),
    nodemailer = require('nodemailer'),
    pdf = require('../controllers/pdf.js'),
    secrets = require('../config/secrets'),
    stripe = require('stripe')(secrets.stripe.secretKey);


/**
 * POST /order/create
 */

exports.create = function (req, res, next) {
    // get noOfPersons, offerID - price, quantity -> calc total amount
    // in case of error on voucher generation or email send, revoke transaction and refund client
    
    if (!req.body.orderData || !req.body.stripeToken)
        return next({ message : 'Invalid data.' });
    
    var stripeToken = req.body.stripeToken,
        chargeId,
        paymentMade = false,
        orderId;
    
    async.waterfall([
        function (done) {
            // calculate amount to be payed based on offer number, no of persons and quantity
            Offer.findById(req.body.orderData.offerId, function (err, offer) {
                if (err)
                    return done(err);
                
                if (!offer)
                    return done({ message : 'Invalid offer number, no offer found.' });
                
                var amountToCharge = offer.price * req.body.orderData.noOfPersons * req.body.orderData.quantity;
                
                done(null, amountToCharge, offer);
            });
        },
        function (amountToCharge, offer, done) {
            // charge via Stripe
            stripe.charges.create({
                amount: convertAmountToCents(amountToCharge),
                currency: 'CAD',
                source: stripeToken.id
            }, function (err, charge) {
                paymentMade = true;
                chargeId = charge.id;
                done(err, amountToCharge, offer);
            });
        },
        function (amountToCharge, offer, done) {
            // get necessary merchant info
            User.findById(offer.merchantId, 'merchantProfile.business', function (err, merchant) {
                done(err, amountToCharge, offer, merchant);
            });
        },
        function (amountToCharge, offer, merchant, done) {
            // generate voucher(s) & insert in DB
            var counter = 0,
                vouchers = [],
                currentDate = new Date(),
                REDEEMABLE_AFTER_HOW_MANY_DAYS = 2;
            
            for (var i = 0; i < req.body.orderData.quantity; i++) {
                var voucher = {
                    offerId: offer._id,
                    offerImageUrl: offer.imgUrl,
                    offerTitle: offer.title,
                    merchant: {
                        name: merchant.merchantProfile.business.name,
                        address: merchant.merchantProfile.business.address,
                        city: merchant.merchantProfile.business.city,
                        province: merchant.merchantProfile.business.province,
                        postalCode: merchant.merchantProfile.business.postalCode,
                        phone: merchant.merchantProfile.business.phone
                    },
                    totalPrice: offer.price * req.body.orderData.noOfPersons,
                    unitaryPrice: offer.price,
                    noOfPersons: req.body.orderData.noOfPersons,
                    buyer: {
                        name: stripeToken.card.name,
                        address: stripeToken.card.address_line1,
                        city: stripeToken.card.address_city,
                        postalCode: stripeToken.card.address_zip,
                        country: stripeToken.card.address_country,
                        email: stripeToken.email,
                        last4card: stripeToken.card.last4
                    },
                    
                    expiresAt: currentDate.setMonth(currentDate.getMonth() + 6),
                    redeemableAfter: new Date().setDate(new Date().getDate() + REDEEMABLE_AFTER_HOW_MANY_DAYS)
                };
                
                voucherCtrl.create(voucher, function (err, createdVoucher) {
                    if (err)
                        return done(err);
                    
                    counter++;
                    vouchers.push(createdVoucher);
                    
                    if (counter == req.body.orderData.quantity)
                        done(null, amountToCharge, offer, merchant, vouchers);
                });
            }
           
        },
        function (amountToCharge, offer, merchant, vouchers, done) {
            // generate order & insert in DB
            var order = {
                chargeAmount: amountToCharge,
                buyerEmail : stripeToken.email
            },
                voucherIds = [];
            
            for (var i = 0; i < vouchers.length; i++) {
                voucherIds.push(vouchers[i]._id);
            }
            
            order.vouchers = [{
                    voucherIds: voucherIds,
                    merchantId: merchant._id,
                    offerId: offer._id,
                    quantity: req.body.orderData.quantity
                }];
            
            var dbOrderObj = new Order(order);
            
            dbOrderObj.save(function (err) {
                if (err)
                    return done(err);
                
                orderId = dbOrderObj._id.toString();
                return done(null, amountToCharge, offer, merchant, vouchers);
            });
        },
        function (amountToCharge, offer, merchant, vouchers, done) {
            // generate pdf vouchers
            var counter = 0,
                voucherPaths = [],
                cleanUpIndex = vouchers[0].voucherNumber;
            
            for (var i = 0; i < vouchers.length; i++) {
                pdf.renderPdf(vouchers[i].voucherNumber, cleanUpIndex, function (err, file) {
                    voucherPaths.push(file);
                    
                    counter++;
                    
                    if (counter == vouchers.length)
                        done(err, amountToCharge, offer, merchant, vouchers, voucherPaths, cleanUpIndex);
                });
            }
            
        },
        function (amountToCharge, offer, merchant, vouchers, voucherPaths, cleanUpIndex, done) {
            // send vouchers via email
            var transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: secrets.sendgrid.user,
                    pass: secrets.sendgrid.password
                }
            });
            
            var attachments = [];
            
            for (var i = 0; i < voucherPaths.length; i++) {
                attachments.push({ path: voucherPaths[i] });
            }
            
            var mailOptions = {
                to: stripeToken.email,
                from: 'no-reply@pricemet.ca',
                subject: 'Your PriceMet vouchers',
                text: 'Hello,\n\n' +
          "Thank you for your order. Attached you'll find your vouchers. Please have them with you physically or on your device when going to the restaurant.\n\n" +
          'Have a great day,\n' +
          'The PriceMet Team',
                attachments: attachments
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err)
                    console.log('!!!<Error in sending vouchers via email.', err);
                
                done(err, cleanUpIndex);
            });
        }
    ], function (err, cleanUpIndex) {
        if (err) {
            // in case of error, refund money via stripe if transaction completed
            if (paymentMade)
                stripe.refunds.create({
                    charge: chargeId
                }, function (err, refund) {
                    if (err)
                        return console.log('Error in refunding transaction', err, chargeId);
                    
                    console.log('Refunded', refund);
                });
            
            return next(err);
        }
        
        res.status(200).send({ message: 'Transaction completed.', orderId: orderId });
        
        //clean up - delete pdf vouchers from disk
        pdf.cleanUp(cleanUpIndex, function () {
            console.log('Finished voucher clean up ', cleanUpIndex);
        });
    });
}

/**
 * GET /order/info
 * Get order info
 */
exports.info = function (req, res, next) {
    req.assert('orderId', 'Order id cannot be blank').notEmpty();
    
    var errors = req.validationErrors(),
        orderInfo = {};
    
    if (errors)
        return next({ message: errors[0].msg });
    
    async.waterfall([ 
        function (done) {
            // get order from DB
            Order.findById(req.query.orderId, function (err, order) {
                if (err)
                    return done(err);
                
                if (!order)
                    return done({ message : 'Invalid order id, no order found.' });
                
                orderInfo.buyerEmail = order.buyerEmail;
                done(err, order);
            });
        },
        function (order, done) {
            // get offer details
            var offerId = order.vouchers[0].offerId;
            
            Offer.findById(offerId, 'title imgUrl', function (err, offer) {
                if (offer)
                    orderInfo.offer = offer;
                
                done(err, order);
            });
        },
        function (order, done) {
            // get merchant details
            var merchantId = order.vouchers[0].merchantId;
            
            User.findById(merchantId, 'merchantProfile.business.name', function (err, merchant) {
                if (merchant)
                    orderInfo.merchant = { name: merchant.merchantProfile.business.name };
                
                done(err, order);
            });
        }
    ], function (err) {
        if (err)
            return next(err);
        
        res.status(200).send({ order: orderInfo });
    });
}

function convertAmountToCents(amount) {
    return amount * 100;
}