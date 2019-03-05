require('./index.less')
const otherTmpl = require('./other.tpl.html')

angular.module('ibss').directive('detailOtherFree', function() {
    return {
        priority: 60,
        restrict: 'E',
        scope: {
            detail: '=',
            opinion: '='
        },
        template: otherTmpl,
        compile: function() {
            return function postLink($scope) {
                $scope.getCause = (n) => {
                    $scope.detail.approvalOpinion = n
                }

                $scope.preview = {
                    src: '',
                    show: 0,
                    rotate: 0
                }

                $scope.showPreview = (img, n) => {
                    $scope.preview.src = img
                    $scope.preview.show = n
                }

            }

        }
    }
})