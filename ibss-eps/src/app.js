var states = states || [];
var menus = menus || undefined;

var app = angular.module('ibss', ['common.frame', 'common.components']);


require('./config.js');
app.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {
    // ,$qProvider
    // $qProvider.errorOnUnhandledRejections(false);

    $httpProvider.defaults.withCredentials = true;

    $urlRouterProvider.otherwise('/index');

    states.forEach(function(state) {
        $stateProvider.state(state.name, state);
    });


    $provide.decorator('uibDatepickerDirective', function($delegate) {
        var directive = $delegate[0];
        var directiveCompile = directive.compile;
        directive.compile = function() {
            var link = directiveCompile.apply(this, arguments);
            return function(scope) {
                link.apply(this, arguments);
                var oldSelect = scope.select;
                scope.select = function(date) {
                    oldSelect.apply(this, arguments);
                    scope.$emit('datepicker.selectDay', scope);
                }
            }
        };
        return $delegate;
    });
    $provide.decorator('uibDatepickerPopupDirective', function($delegate) {
        var directive = $delegate[0];
        var directiveCompile = directive.compile;
        directive.compile = function() {
            var link = directiveCompile.apply(this, arguments);
            return function(scope) {
                link.apply(this, arguments);
                var oldSelect = scope.select;
                scope.select = function(date) {
                    oldSelect.apply(this, arguments);
                    scope.$emit('datepicker.selectDay', scope);
                }
            }
        };
        return $delegate;
    });
});

app.run(function($rootScope) {
    $rootScope.pageLoaded = true;
    if (menus) {
        console.log('Local menus read.');
        $rootScope.menus = menus;
    }

    $rootScope.$on('$stateChangeStart', function() {
        $rootScope.viewsLoaded = false;
    });
    $rootScope.$on('$viewContentLoaded', function() {
        $rootScope.viewsLoaded = true;
    });
});