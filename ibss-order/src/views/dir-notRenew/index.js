require('./index.less')
require('common/components/services/utils.js')
var viewTmpl = require('./view.tpl.html')
var tagReason = require('./config');

angular.module('ibss').directive('notRenew', function($rootScope, toaster, AMser, ibssUtils, $timeout, customDialog) {
    return {
        restrict: 'E',
        scope: {
            id: '=',
            reason: '=',
            ui: '=',
            tag: '='
        },
        template: viewTmpl,
        link: function($scope) {

            var INFO = {
                NOT_RENEW_ERR: '请填写不续费原因',
                NOT_RENEW_SUCC: '保存成功',
                NOT_TAG_ERR: '请选择不续费原因'
            }

            $scope.query = function () {
                var data = {};

                ibssUtils.api({
                    url: _APIs.od_queryrenewlist + $scope.id,
                    method: 'POST',
                    data: data
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.orderNumber = res.data.model.length;
                    }
                })
            }

            $scope.save = function () {

                var tags = $scope.getTagReason();

                if (!tags.length) {
                    toaster.pop('error', INFO.NOT_TAG_ERR);
                    return;
                }

                if (!$scope.reason) {
                    toaster.pop('error', INFO.NOT_RENEW_ERR);
                    return;
                }

                var saveData = {
                    subOrderId: $scope.id,
                    reason: $scope.reason,
                    tags: tags
                };

                ibssUtils.api({
                    url: _APIs.od_updatenorenew,
                    method: 'POST',
                    data: saveData
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        toaster.pop('success', INFO.NOT_RENEW_SUCC);
                    }
                })

                $scope.ui.ok();
            }

            $scope.cancel = function () {
                $scope.ui.off();
            }

            $scope.getTagReason = function () {
                var tags = $scope.tagReason;
                var result = [];

                for (var i in tags) {
                    if (tags.hasOwnProperty(i)) {
                        if (tags[i].value) {
                            result.push(i);
                        }
                    }
                }

                return result;
            }

            $scope.tagReasonInit = function () {
                $scope.tagReason = $.extend(true, {}, tagReason);
                $scope.tag = $scope.tag.split(',');

                $scope.tag.map(function (item) {
                    $scope.tagReason[item].value = true;
                });
            };

            $scope.init = function () {
                $scope.orderNumber = 0;
                $scope.tagReasonInit();
                $scope.query();
            }

            $scope.init();
        }
    }
});