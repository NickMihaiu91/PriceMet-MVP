(function () {

    var OuiBounceModalApp = angular.module('OuiBounceModalApp', []);
    
    OuiBounceModalApp.controller('OuiBounceCtrl', function ($scope, $timeout) {
        ouibounce(false, {
            aggressive: true,
            sensitivity: 100,
            callback: function () {
                $('#ouibounce-modal').modal('show');
                mixpanel.track("Showed Page Close Feedback Modal");
            }
        });

        $scope.sendFeedback = function (option, $event) {
            $timeout(function () { 
                $scope.sentFeedback = true;
            }, 300);
            
            $event.preventDefault();

            mixpanel.track("Page Close Feedback", { option: option });
        };

        $scope.otherOptionClicked = function () {
            $scope.otherOptionSelected = true;

            mixpanel.track("Page Close Feedback", { option: 'other' });
        };

        $scope.sendTextFeedback = function (text) {
            $timeout(function () {
                $scope.sentFeedback = true;
            }, 300);

            mixpanel.track("Page Close Feedback Other Text", { feedback: text });
        };

        $scope.noHelp = function () { 
            mixpanel.track("Page Close Feedback No Help");
        };
    });

    OuiBounceModalApp.directive('ouibouncemodal', function () {
        return {
            restrict: 'E',
            scope: {
                optionlist: '='
            },
            templateUrl: '../partials/ouibounce-modal.html',
            controller: 'OuiBounceCtrl'
        };
    });
    
})();