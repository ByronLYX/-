require('./index.less');
var templateStr = require('./index.html');
angular.module('common.components').directive('previewOrder', function(ibssUtils, customDialog, $timeout) {
    return {
        restrict: 'EA',
        template: templateStr,
        scope: {
            preview: '='
        },
        link: function($scope, elem) {
            $scope.rotatePre = function(deg) {
                $scope.preview.rotate += deg;
                elem.find('.preview-pic')
                    .css({
                        'msTransform': 'translate(-50%,-50%) rotate(' + $scope.preview.rotate + 'deg)',
                        'mozTransform': 'translate(-50%,-50%) rotate(' + $scope.preview.rotate + 'deg)',
                        'webkitTransform': 'translate(-50%,-50%) rotate(' + $scope.preview.rotate + 'deg)',
                        'transform': 'translate(-50%,-50%) rotate(' + $scope.preview.rotate + 'deg)'
                    });
            };
            $scope.closePreview = function() {
                $timeout(function() {
                    $scope.preview.src = '';
                    $scope.preview.show = 0;
                    $scope.preview.rotate = 0;
                }, 10);
            };
        }
    };
});