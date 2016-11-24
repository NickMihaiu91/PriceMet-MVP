var userController = require('../controllers/user');

exports.routeUserRequests = function (app, passport, passportConf) {
    app.post('/user/login', userController.login);
    app.get('/user/isUserAuthenticated', passportConf.isAuthenticated, userController.isUserAuthenticated);
    app.get('/user/isMerchantAuthenticated', passportConf.isAuthenticated, userController.isMerchant, userController.isUserAuthenticated);
    
    app.post('/user/createMerchant', passportConf.isAuthenticated, userController.isAdmin, userController.createMerchant);

    app.get('/user/logout', userController.logout);
    app.post('/user/forgot', userController.postForgot);
    app.post('/user/reset', userController.postReset);
    
    
    //app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
    //app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
    //app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
    //app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);
    
    /**
    * OAuth authentication routes. (Sign in)
    */
    //app.get('/auth/instagram', passport.authenticate('instagram'));
    //app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    //app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
    //app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    //app.get('/auth/github', passport.authenticate('github'));
    //app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    //app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
    //app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    //app.get('/auth/twitter', passport.authenticate('twitter'));
    //app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    //app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
    //app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), function (req, res) {
    //    res.redirect(req.session.returnTo || '/');
    //});
    
    /**
    * OAuth authorization routes. (API examples)
    */
    //app.get('/auth/foursquare', passport.authorize('foursquare'));
    //app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function (req, res) {
    //    res.redirect('/api/foursquare');
    //});
    //app.get('/auth/tumblr', passport.authorize('tumblr'));
    //app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function (req, res) {
    //    res.redirect('/api/tumblr');
    //});
    //app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
    //app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function (req, res) {
    //    res.redirect('/api/venmo');
    //});
};