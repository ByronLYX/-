angular.module('ibss')
    .directive('limitVal', function(toaster) {
        return {
            restrict: 'EA',
            require: 'ngModel',
            scope: {
                maxVal: '=',
                minVal: '='
            },
            link: function($scope, elm, attrs, ctrl) {
                var tempMax = $scope.maxVal;
                var tempMin = $scope.minVal || 0;
                ctrl.$parsers.unshift(function(viewValue) {
                    viewValue = ~~viewValue;
                    console.log($scope.maxVal, viewValue, tempMin, $scope.maxVal && viewValue <= $scope.maxVal && viewValue >= tempMin)
                    if ($scope.maxVal && viewValue <= $scope.maxVal && viewValue >= tempMin) {
                        ctrl.$setValidity('limitVal', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('limitVal', false);
                        toaster.pop('error', '当前允许的最大数为' + tempMax + '，最小数量为' + tempMin);
                        $(elm).val(tempMax)
                        return viewValue;
                    }
                    if ($scope.minVal && viewValue >= $scope.minVal && viewValue >= tempMin) {
                        ctrl.$setValidity('limitVal', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('limitVal', false);
                        toaster.pop('error', '当前允许的最小数为' + tempMin + '，最小数量为' + tempMin);
                        $(elm).val(tempMin);
                        return viewValue;
                    }
                });
            }
        }
    })
    .directive('email', function() {
        return {
            restrict: 'EA',
            require: 'ngModel',
            link: function($scope, elm, attrs, ctrl) {
                var EMAIL_REGEXP = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
                ctrl.$parsers.unshift(function(viewValue) {
                    if (EMAIL_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('email', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('email', false);
                        return undefined;
                    }
                });
            }
        }
    })
    .directive('phone', function(AMser) {
        return {
            restrict: 'EA',
            require: 'ngModel',
            link: function($scope, elm, attrs, ctrl) {
                var PHONE_REGEXP = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
                var INTEGER_REGEXP = /^\d*$/;
                elm.off('keyup').on('keyup', function() {
                    var $dom = $(this);
                    var result = ($dom.val().replace(/[^\d]/g, ''));
                    result = AMser.CtoH(result);
                    if (!INTEGER_REGEXP.test(result) && !isNaN(result) && result !== '') {
                        result = result.substr(0, result.length - 1);
                    }
                    $dom.val(result);
                    ctrl.$setViewValue(result ? parseInt(result) : result, true); //只能赋模型的值不能改变VIEW
                    setTimeout(function() {
                        ctrl.$setValidity('vPhone', true);
                    }, 100);
                });
                ctrl.$parsers.unshift(function(viewValue) {
                    if (PHONE_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('phone', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('phone', false);
                        return undefined;
                    }
                });
            }
        }
    })
    .directive('number', function(AMser) {
        return {
            require: 'ngModel',
            scope: { maxNumber: '=', minNumber: '=', max: '@', min: '@', ngModel: '=', ngRequired: '=' },
            link: function(scope, elm, attrs, ctrl) {
                var NUMBER_REGEXP = /^([1-9][0-9]*)+(.[0-9]{1,2})?$/;
                var INTEGER_REGEXP = /^\d*$/;
                ctrl.$parsers.unshift(function(viewValue) {
                    if (NUMBER_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('number', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('number', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('int', function(AMser) {
        return {
            require: 'ngModel',
            scope: { maxNumber: '=', minNumber: '=', max: '@', min: '@', ngModel: '=', ngRequired: '=' },
            link: function(scope, elm, attrs, ctrl) {
                var INTEGER_REGEXP = /^\d*$/;
                ctrl.$parsers.unshift(function(viewValue) {
                    if (INTEGER_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('int', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('int', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('account', function(AMser) {
        return {
            require: 'ngModel',
            scope: { maxNumber: '=', minNumber: '=', max: '@', min: '@', ngModel: '=', ngRequired: '=' },
            link: function(scope, elm, attrs, ctrl) {
                var INTEGER_REGEXP = /[0-9a-zA-Z/_/-]*$/gi;
                ctrl.$parsers.unshift(function(viewValue) {
                    if (INTEGER_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('account', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('account', false);
                        return undefined;
                    }
                });
            }
        };
    })
    .directive('idcard', function() {
        return {
            restrict: 'EA',
            require: 'ngModel',
            link: function($scope, elm, attrs, ctrl) {
                var idCard_REGEXP = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/i;
                ctrl.$parsers.unshift(function(viewValue) {
                    if (idCard_REGEXP.test(viewValue)) {
                        ctrl.$setValidity('idcard', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('idcard', false);
                        return undefined;
                    }
                });
            }
        }
    });