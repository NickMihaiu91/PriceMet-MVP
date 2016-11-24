(function () {
    
    var adminOptionsApp = angular.module('adminOptionsApp', ['authServiceModule'])
    .run(['authService', function (authService) {
            authService.isLoggedIn(function (err) {
                if (err)
                    return window.location.assign('/admin-login');
            });
        }]);

})();