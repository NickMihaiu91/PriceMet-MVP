var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true },
    password: String,
    
    facebook: String,
    twitter: String,
    google: String,
    github: String,
    instagram: String,
    linkedin: String,
    tokens: Array,
    
    merchantProfile: {
        owner: {
            firstName: String,
            lastName: String,
            phone: String
        },
        business: {
            name: String,
            address: String,
            city: String,
            province: String,
            postalCode: String,
            industry: String,
            otherInfo: String,
            phone: String,
            description: String,
            images: [String]
        },
        online: {
            website: String,
            facebook: String,
            twitter: String,
            yelp: String,
            yelpId: String
        },
        commissionPercentage: Number,
        offerConversionRate: { type: Number, default: 10 },
        isValid: Boolean
    },
    
    role: { type: String, lowercase: true },  // can be one of: merchant, admin or user
    
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size) {
    if (!size) size = 200;
    if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

/**
 * Helper method to check if user is Admin
 */
userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};

/**
 * Helper method to check if user is Merchant
 */
userSchema.methods.isMerchant = function () {
    return this.role === 'merchant';
};

module.exports = mongoose.model('User', userSchema);
