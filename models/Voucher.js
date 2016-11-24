var mongoose = require('mongoose');

var voucherSchema = new mongoose.Schema({
    voucherNumber: { type: String, unique: true },
    
    offerId: mongoose.Schema.Types.ObjectId,
    offerImageUrl: String,
    offerTitle: String,
    
    merchant: {
        name: String,
        address: String,
        city: String,
        province: String,
        postalCode: String,
        phone: String
    },
    
    totalPrice: Number,
    unitaryPrice: Number,
    noOfPersons: Number,
    
    buyer: {
        name: String,
        address: String,
        city: String,
        postalCode: String,
        country: String,
        email: String,
        last4card: String
    },
    
    expiresAt: Date,
    redeemableAfter: Date,
    redeemedAt: Date
});

module.exports = mongoose.model('Voucher', voucherSchema);