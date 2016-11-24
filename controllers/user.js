var _ = require('lodash'),
    async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    passport = require('passport'),
    User = require('../models/User'),
    secrets = require('../config/secrets');

/**
 * POST /user/login
 * Sign in using email and password.
 */
exports.login = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user)
            return next({ message: info.message });
        
        req.logIn(user, function (err) {
            if (err) return next(err);
            
            res.status(200).send('Ok');
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = function (req, res) {
    req.logout();
    res.status(200).send('Ok');
};

/**
 * GET /user/isUserAuthenticated
 * Is user authenticated.
 */
exports.isUserAuthenticated = function (req, res) {
    res.status(200).send('Ok');
};

exports.createMerchant = function (req, res, next) {
    // Verify data
    req.assert('merchant.email', 'Email is not valid').isEmail();
    req.assert('merchant.password', 'Password must be at least 4 characters long').len(4);
    req.assert('merchant.merchantProfile.owner.firstName', 'First name must be set').notEmpty();
    req.assert('merchant.merchantProfile.owner.lastName', 'Last name must be set').notEmpty();
    req.assert('merchant.merchantProfile.owner.phone', 'Phone must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.name', 'Business name must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.address', 'Business address must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.city', 'City must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.province', 'Province must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.postalCode', 'Postal code must be set').notEmpty();
    req.assert('merchant.merchantProfile.business.industry', 'Industry must be set').notEmpty();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    // Create account
    var user = new User(req.body.merchant);
    user.role = 'merchant';
    
    if (user.merchantProfile.online && user.merchantProfile.online.yelp) {
        var urlParts = user.merchantProfile.online.yelp.split('/');
        user.merchantProfile.online.yelpId = urlParts[urlParts.length - 1];
    }
    
    User.findOne({ email: req.body.merchant.email }, function (err, existingUser) {
        if (err) return next(err);
        
        if (existingUser)
            return next({ message : 'A user with this email is already registered.' });
        
        user.save(function (err) {
            if (err) return next(err);
            
            return res.status(200).send('Merchant account created succesfully.');
        });
    });
};

exports.isAdmin = function (req, res, next) {
    if (req.user && req.user.isAdmin())
        return next();
    else
        return next('Not authorized.');
};

exports.isMerchant = function (req, res, next) {
    if (req.user && req.user.isMerchant())
        return next();
    else
        return next('Not authorized.');
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = function (req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    
    var errors = req.validationErrors();
    
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/signup');
    }
    
    var user = new User({
        email: req.body.email,
        password: req.body.password
    });
    
    User.findOne({ email: req.body.email }, function (err, existingUser) {
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' });
            return res.redirect('/signup');
        }
        user.save(function (err) {
            if (err) return next(err);
            req.logIn(user, function (err) {
                if (err) return next(err);
                res.redirect('/');
            });
        });
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) return next(err);
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.website || '';
        
        user.save(function (err) {
            if (err) return next(err);
            req.flash('success', { msg: 'Profile information updated.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = function (req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    
    var errors = req.validationErrors();
    
    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/account');
    }
    
    User.findById(req.user.id, function (err, user) {
        if (err) return next(err);
        
        user.password = req.body.password;
        
        user.save(function (err) {
            if (err) return next(err);
            req.flash('success', { msg: 'Password has been changed.' });
            res.redirect('/account');
        });
    });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = function (req, res, next) {
    User.remove({ _id: req.user.id }, function (err) {
        if (err) return next(err);
        req.logout();
        req.flash('info', { msg: 'Your account has been deleted.' });
        res.redirect('/');
    });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = function (req, res, next) {
    var provider = req.params.provider;
    User.findById(req.user.id, function (err, user) {
        if (err) return next(err);
        
        user[provider] = undefined;
        user.tokens = _.reject(user.tokens, function (token) { return token.kind === provider; });
        
        user.save(function (err) {
            if (err) return next(err);
            req.flash('info', { msg: provider + ' account has been unlinked.' });
            res.redirect('/account');
        });
    });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    User
    .findOne({ resetPasswordToken: req.params.token })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function (err, user) {
        if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('/forgot');
        }
        res.render('account/reset', {
            title: 'Password Reset'
        });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function (req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    async.waterfall([
        function (done) {
            User
        .findOne({ resetPasswordToken: req.body.token })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function (err, user) {
                if (!user)
                    return next({ message : 'Password reset token is invalid or has expired.' });
                
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                
                user.save(function (err) {
                    if (err) return done(err);
                    req.logIn(user, function (err) {
                        done(err, user);
                    });
                });
            });
        },
        function (user, done) {
            var transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: secrets.sendgrid.user,
                    pass: secrets.sendgrid.password
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'no-reply@pricemet.ca',
                subject: 'Your Pricemet.ca password has been changed',
                text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                if (err)
                    console.log('Error in sending reset confirmation email.', err);
                
                done(err);
            });
        }
    ], function (err) {
        if (err) return next(err);
        
        res.status(200).send({ message: 'The password for your account has been succesfully changed.' });
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function (req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    
    var errors = req.validationErrors();
    
    if (errors)
        return next({ message: errors[0].msg });
    
    async.waterfall([
        function (done) {
            crypto.randomBytes(16, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
                if (!user)
                    return next({ message: 'No account with that email address exists.' });
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var transporter = nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: secrets.sendgrid.user,
                    pass: secrets.sendgrid.password
                },
                debug: true
            });
            var mailOptions = {
                to: user.email,
                from: 'no-reply@pricemet.ca',
                subject: 'Reset your password on Pricemet.ca',
                text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset-password?token=' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                if (!err)
                    res.status(200).send({ message: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
                
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
    });
};