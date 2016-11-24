(function () {

    var priceMetApp = angular.module('priceMetApp', ['offersServiceModule', 'orderServiceModule', 'OuiBounceModalApp']);

    priceMetApp.controller('CompleteOrderCtrl', function ($scope, $timeout, $location, offersService, orderService) {
        var stripeHandler;
        $scope.quantity = 1;

        $timeout(function () {
            Parse.initialize("rABaK3FXscnhAej5m3WNT8jQuaEHiFpwCAcGgEbv", "QkE1Q8Nsb6Fy8GkeKBJNmNidxzV2g8TIKprOEKOe");

            var offerId = getParameterByName('id'),
                noOfPersons = getParameterByName('n');
            
            $scope.noOfPersons = noOfPersons;
            
            $scope.safeApply = function (fn) {
                var phase = this.$root.$$phase;
                if (phase == '$apply' || phase == '$digest') {
                    if (fn && (typeof (fn) === 'function')) {
                        fn();
                    }
                } else {
                    this.$apply(fn);
                }
            };

            offersService.getOfferById(offerId, noOfPersons, function (offer) {
                $scope.offer = offer;
                $scope.total = offer.offerPrice * $scope.quantity;
                $scope.safeApply();
            });
            
            stripeHandler = StripeCheckout.configure({
                key: /*'pk_live_JBQliKqoesbsQZvJKD6JFR7J', */ 'pk_test_6BUzUnkxbKJVAJk7bpPZ6sKj', 
                image: '/images/pricemet_small_logo.jpg',
                locale: 'auto',
                billingAddress: true,
                currency: 'CAD',
                token: function (token) {
                    
                    var orderData = {
                        offerId: offerId,
                        noOfPersons: noOfPersons,
                        quantity: $scope.quantity
                    };
                    
                    swal({
                        title: 'Processing your order', 
                        html: '<div class="loader-inner line-scale-pulse-out"><div></div><div></div><div></div><div></div><div></div></div>',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        showConfirmButton: false
                    });

                    orderService.createOrder({ orderData: orderData, stripeToken: token }, function (err, data) {
                        if (err) {
                            swal.closeModal();
                            $('#completeOrderModalError').modal();
                            return console.log('error in completing transaction', err);
                        }
                        
                        window.location.assign('/thank-you?orid=' + data.orderId);
                    });
                }
            });

            mixpanel.track("Complete order Page Viewed", { 'offerId': offerId, 'noOfPersons': noOfPersons });
        }, 300);

        $scope.completeOrder = function () {

            stripeHandler.open({
                name: 'PriceMet.ca',
                description: $scope.offer.bidOfferTitle,
                amount: convertAmountToCents($scope.total),
                panelLabel: 'Pay'
            });

            mixpanel.track("Complete order button clicked");
        };

        $scope.$watch('quantity', function () {
            if ($scope.offer)
                $scope.total = $scope.offer.offerPrice * $scope.quantity;

            if ($scope.quantity > 1)
                mixpanel.track("Quantity changed", { 'quantity': $scope.quantity });
        });

        $scope.termsAndConditionsClicked = function () {
            mixpanel.track("Terms and conditions clicked");
        };

        $scope.privacyStatementClicked = function () {
            mixpanel.track("Privacy statement clicked");
        };

        $scope.orderFaqFirstSectionClicked = function () {
            mixpanel.track("Payment FAQ - What happens after I click 'Complete order'");
        };

        $scope.orderFaqSecondSectionClicked = function () {
            mixpanel.track("Payment FAQ - What happens after I buy?");
        };

        $scope.orderFaqThirdSectionClicked = function () {
            mixpanel.track("Payment FAQ - Can I change or cancel my purchase?");
        };

        $scope.orderFaqFourthSectionClicked = function () {
            mixpanel.track("Payment FAQ - Is this safe?");
        };

        $scope.closePageFeedbackOption = ["I wanted to see what happens if I click 'Accept Bid'",
            "I wasn't intending to complete the order",
            "I don't trust your website",
            "I only pay with PayPal"];
    });

    priceMetApp.controller('CompleteOrderModalCtrl', function ($scope, $timeout) {

        $scope.sendEmail = function () {
            var validEmail = validateEmail($scope.email);

            $scope.showEmailError = false;

            mixpanel.track("Complete order Send Email", { 'email': $scope.email });

            if (!validEmail)
                return $scope.showEmailError = true;

            $scope.sentEmailAddress = true;
            saveEmail($scope.email);
        };
    });

    priceMetApp.controller('headerCtrl', function ($scope, $timeout) {
        $scope.logIn = function () {
            $timeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'log in' });
        };

        $scope.signUp = function () {
            $timeout(function () {
                swal({ title: 'Oops', text: 'There seems to be a problem. Please try again later, we are very sorry.', type: 'error' });
            }, 2000);
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'sign up' });
        };

        $scope.getInTouch = function () {
            $('footer').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'contact us' });
        };

        $scope.needHelp = function () {
            $('footer').scrollintoview({ duration: 500 });
            $('.navbar-collapse').collapse('hide');
            mixpanel.track("Navbar", { 'option': 'help' });
        };
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function validateEmail(email) {
        var re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return re.test(email);
    }

    function saveEmail(email) {
        var EmailObject = Parse.Object.extend("Email"),
            emailObject = new EmailObject();

        emailObject.save({
            email: email
        });
    }

    function convertAmountToCents(amount) { 
        return amount * 100;
    }
})();