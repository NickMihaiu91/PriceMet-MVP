var mongoose = require('mongoose');

var voucherQuantity = {
    voucherIds: [mongoose.Schema.Types.ObjectId],
    merchantId: mongoose.Schema.Types.ObjectId,
    offerId: mongoose.Schema.Types.ObjectId,
    quantity: Number
},
    voucherQuantitySchema = mongoose.Schema(voucherQuantity,
    {
        _id: false
    });

var orderSchema = new mongoose.Schema({
    vouchers: [voucherQuantity],
    chargeAmount: Number,
    buyerEmail: String
});

module.exports = mongoose.model('Order', orderSchema);