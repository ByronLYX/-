require('./index.less');
var templateStr = require('./index.html');
angular.module('common.components').directive('showMore', function(ibssUtils, customDialog, $timeout, toaster, AMser) {
    return {
        restrict: 'EA',
        template: templateStr,
        scope: {
            code: '@'
        },
        link: function($scope, elem) {
            if (!$scope.code) {
                return;
            }
            $scope.code = JSON.parse($scope.code)
            var _temp = {};
            window._localtionObj[0].forEach(function(l) {
                $scope.code.forEach(function(item) {
                    if (item == l.value) {
                        return;
                    }
                    var obj = window._localtionObj[l.value];
                    for (var i = 0, len = obj.length; i < len; i++) {
                        if (obj[i].value == item && !_temp[obj[i].parentValue]) {
                            _temp[obj[i].parentValue] = true;
                            break;
                        }
                    }
                });
            })
            for (var key in _temp) {
                if ($scope.code.indexOf(key) == -1) {
                    $scope.code.push(key)
                }
            }
            $scope.showMore = function() {
                $scope.showLocaltionList = !$scope.showLocaltionList;
            };
            $scope.regionObj = {};

            function getData(code, obj) {
                return AMser.getServiceArea(code, obj);
            };
            if (!window._localtionObj) {
                var _AREA = AMser.getLocaltion(getData($scope.code, $scope.regionObj));
            } else {
                var _AREA = getData($scope.code, $scope.regionObj);
            }
            $scope.regionObj = _AREA.obj;
            $scope.locationProv = _AREA.provs.join('-');
        }
    };
});