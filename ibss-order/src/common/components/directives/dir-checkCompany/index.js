require('./index.less');
var tempCompany = require('./index.html');
angular.module('common.components')
    .directive('checkCompany', function(customDialog, ibssUtils, toaster) {
        return {
            priority: 85,
            restrict: 'EA',
            template: tempCompany,
            scope: {
                detail: "="
            },
            link: function($scope) {
                $scope.checkAccount = function() {
                    $scope.detail.checkAccount = false;
                    var ACCOUNT = /^[a-zA-Z][a-zA-Z0-9_]{5,19}$/;
                    if (!ACCOUNT.test($scope.detail.enterpriseAccount)) {
                        return;
                    }
                    ibssUtils.api({
                        url: _APIs.ep_checkAccount + $scope.detail.enterpriseAccount
                    }).then(function suc(res) {
                        if (res.data && res.data.success) {
                            if (res.data.model) {
                                toaster.pop('error', '企业账号已被使用，请更换');
                            } else {
                                $scope.detail.checkAccount = true;
                            }
                        }
                    });
                };
                $scope.addEmployee = function(item) {
                    customDialog.open({
                        title: '选择员工',
                        content: '<div><assign return-item="returnItem" only="true"></assign></div>',
                        noResize: true,
                        enterText: '选择员工',
                        cancelText: '关闭',
                        okCallback: function(e) {
                            $scope.returnItem = e.returnItem;
                            returnNgModel($scope.returnItem, item);
                        },
                        ctrl: function(dialogScope) {
                            dialogScope.returnItem = [];
                        }
                    });
                };

                function returnNgModel(data, key) {
                    $scope.detail[key] = data[0].accountId;
                    $scope.detail[key + 'Name'] = data[0].accountName;
                }
            }
        };
    });