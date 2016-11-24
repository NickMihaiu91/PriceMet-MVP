var mongoose = require('mongoose');

var offerSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    price: Number,
    originalPrice: Number,
    minPrice: Number,
    ipps: [Number], // intermediate pricing points
    imgUrl: String,
    merchantId: mongoose.Schema.Types.ObjectId,
    offerType: { type: String, default: 'r' },
    expiresAt: Date,
    updatedAt: Date
});

offerSchema.pre('save', function (next) {
    now = new Date();
    this.updatedAt = now;
    next();
});

module.exports = mongoose.model('Offer', offerSchema);