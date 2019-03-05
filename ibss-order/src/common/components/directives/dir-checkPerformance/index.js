require('./index.less');
var tempPerformance = require('./index.html');
angular.module('common.components')
    .directive('checkPerformance', function($rootScope, ibssUtils, $timeout, toaster, AMser, customDialog) {
        return {
            priority: 80,
            restrict: 'EA',
            template: tempPerformance,
            scope: {
                detail: "=",
                status: '='
            },
            link: function($scope) {

                $scope.addEmployee = function(product, type) {
                    customDialog.open({
                        title: '查询员工',
                        content: '<div><assign return-item="returnItem"></assign></div>',
                        noResize: true,
                        enterText: '选择员工',
                        cancelText: '关闭',
                        okCallback: function(e, fn) {
                            addEmployeeData(e.returnItem, type);
                            $scope.returnItem = e.returnItem;
                            return;
                        },
                        ctrl: function(dialogScope, $uibModalInstance) {
                            dialogScope.returnItem = [];
                        }
                    });

                    function addEmployeeData(data, type) {
                        data.forEach(function(item) {
                            var obj = {
                                accountId: item.accountId,
                                accountName: item.accountName,
                                companyId: item.companyId,
                                companyName: item.companyName,
                                deptId: item.deptId,
                                deptName: item.deptName,
                                amount: '',
                                type: type,
                                tag: Math.random().toString(16).substr(4, 12)
                            };
                            product.commissionDistributions.push(obj);
                            $scope.countComAmount(product, obj);
                            // if (!angular.isNumber(product.tip)) {
                            //     product.tip = product.amount;
                            // }
                            // if (item.type == 2 && !angular.isNumber(product.tipDouble)) {
                            //     product.tipDouble = product.amount;
                            // }
                        });
                    }
                };
                $scope.radioStatus = function(item) {
                    if (item.isDouble == 1) {
                        item.tipDouble = '';
                        var arr = [];
                        if (item.commissionDistributions.length) {
                            item.commissionDistributions.forEach(function(item) {
                                if (item.type == 1) {
                                    arr.push(item)
                                }
                            })
                            item.commissionDistributions = arr;
                        }
                    }
                }
                $scope.deleteEmployee = function(item, employee) {
                    var idx = 0;
                    var count = 0;
                    item.commissionDistributions.forEach(function(i, index) {
                        if (i.tag == employee.tag) {
                            idx = index;
                        }
                    });
                    item.commissionDistributions.splice(idx, 1);
                    $scope.countComAmount(item, employee);
                    item.commissionDistributions.forEach(function(item) {
                        if (item.type == 2) {
                            count += 1;
                        }
                    });
                    if (!count) {
                        item.isDouble = false;
                    }
                };
                $scope.countComAmount = function(item, employee) {
                    if (employee.amount) {
                        var NUMBER_REGEXP = /^[0-9]+(.[0-9]{1,2})?$/;
                        if (!NUMBER_REGEXP.test(employee.amount)) {
                            toaster.pop('error', '金额小数点后保留2位');
                            employee.amount = '';
                        }
                    }
                    var amount = 0;
                    var type = employee.type;
                    item.commissionDistributions.forEach(function(i) {
                        if (i.type == type) {
                            amount += i.amount || 0;
                        }
                    });
                    if (amount < item.amount) {
                        if (type == 1) {
                            item.tip = ~~(item.amount - amount).toFixed(2);
                        } else {
                            item.tipDouble = ~~(item.amount - amount).toFixed(2);
                        }
                    }
                    if (amount == item.amount) {
                        if (type == 1) {
                            item.tip = 0;
                        } else {
                            item.tipDouble = 0;
                        }
                    }
                    console.log(item)
                    if (amount > item.amount) {
                        toaster.pop('error', '绩效总额不能大于收款金额');
                        $timeout(function() {
                            employee.amount = '';
                        }, 500);
                    }
                };
            }
        };
    });