var Voucher = require('../models/Voucher'),
    VOUCHER_NUMBER_LENGTH = 7;

/**
 * GET /voucher/find
 * Get voucher details
 */
exports.find = function (req, res, next) {
    req.assert('voucherNo', 'Voucher number cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    Voucher.findOne({ voucherNumber: req.query.voucherNo }, function (err, existingVoucher) {
        if (err) return next(err);
        
        if (!existingVoucher)
            return next({ message : 'Invalid voucher number, no voucher found.' });
        
        res.status(200).send({ voucher: existingVoucher });
    });
};


/**
 * POST /voucher/isValid
 * Check voucher number validity
 */
exports.isValid = function (req, res, next) {
    req.assert('voucherNo', 'Voucher number cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    Voucher.findOne({ voucherNumber: req.body.voucherNo }, 'voucherNumber', function (err, existingVoucher) {
        if (err) return next(err);
        
        if (!existingVoucher)
            return next({ message : 'Invalid voucher number, no voucher found.' });
        
        res.status(200).send('Valid voucher.');
    });
};


/**
 * POST /voucher/redeem
 * Redeem a voucher
 */
exports.redeem = function (req, res, next) {
    req.assert('voucherNo', 'Voucher number cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    Voucher.findOne({ voucherNumber: req.body.voucherNo }, function (err, existingVoucher) {
        if (err) return next(err);
        
        if (!existingVoucher)
            return next({ message : 'Invalid voucher number, no voucher found.' });
        
        if (existingVoucher.redeemedAt)
            return next({ message : 'Voucher was already redeemed.' });
        
        if (existingVoucher.expiresAt < new Date())
            return next({ message : 'Voucher expired at ' + existingVoucher.expiresAt });
        
        existingVoucher.redeemedAt = new Date();
        
        existingVoucher.save(function (err) {
            if (err) return next(err);
            
            res.status(200).send('Voucher redeemed succesfully.');
        });
    });
};

/**
 * Create a voucher
 */

exports.create = function (voucherData, next) {
    var voucher = new Voucher(voucherData);

    voucher.voucherNumber = generateIdentifier(VOUCHER_NUMBER_LENGTH);

    Voucher.findOne({ voucherNumber: voucher.voucherNumber }, function (err, existingVoucher) { 
        if (err) return next(err);
    
        if (existingVoucher)
            return exports.create(voucherData, next);

        voucher.save(function (err) {
            if (err) return next(err);
            
            return next(null, voucher);
        });
    });
};

var generateIdentifier = function (length) {
    var text = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < length; i++)
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    
    return text;
};