require('./index.less');
var tempProduct = require('./index.html');
angular.module('common.components').directive('checkProduct', function($rootScope, ibssUtils, $timeout, toaster) {
    return {
        priority: 75,
        restrict: 'EA',
        template: tempProduct,
        scope: {
            detail: "=",
            readonly: '=',
            recount: '=',
            canUpdate: '='
        },
        link: function($scope) {
            $scope.subProductCheckbox = function(item) {
                item.cur = !item.cur;
                $timeout(function() {
                    $scope.getAmount();
                }, 10);
            };
            $scope.chooseProducts = function(item, idx) {
                if ($scope.status) {
                    return;
                }
                var d = $scope.detail.products;
                var len = d.length;
                item.cur = !item.cur;
                if (item.productParentType !== 1 && item.productDetails && item.productDetails.length == 1) {
                    item.productDetails[0].cur = !item.productDetails[0].cur;
                }
                if (item.productParentType == 1) {
                    for (var i = 0; i < len; i++) {
                        if (d[i].productParentType == 1 && i != idx) {
                            d[i].cur = false;
                        } else {
                            selectToPrd(d[i]);
                        }
                    }
                    if (!item.cur) {
                        $scope.showProduct = 0;
                    }
                } else {
                    selectToPrd(item);
                }
            };
            $scope.closeProduct = function(idx) {
                var item = null;
                $scope.detail.products.forEach(function(product) {
                    if (product.productParentId == idx) {
                        item = product
                    }
                });
                item.cur = !item.cur;
                if (item.productParentType == 1) {
                    $scope.showProduct = 0;
                }
                switch (item.productParentId) {
                    case 5:
                        $scope.showOption = item.cur;
                        break;
                    case 6:
                        $scope.showSpace = item.cur;
                        break;
                    case 7:
                        $scope.showTime = item.cur;
                        break;
                }
            };
            $scope.optionAmount = function(item, idx) {
                $scope.optionIndex = idx;
                $scope.optionData.forEach(function(i, j) {
                    if (j == idx) {
                        i.cur = true;
                    } else {
                        i.cur = false;
                        i.order.amount = 0;
                    }
                });
                $timeout(function() {
                    $scope.countAmount();
                }, 100);
            };
            $scope.getAmount = function() {
                var obj = {};
                var st = $scope.detail.products.startTime,
                    et = $scope.detail.products.endTime;
                $scope.detail.products.forEach(function(item, idx) {
                    if (item.cur) {
                        if (item.productId < 100) {
                            if (et && st > et) {
                                $scope.detail.products.startTime = '';
                                $scope.detail.products.endTime = '';
                                toaster.pop('error', '开始时间不能大于结束时间');
                                return;
                            }
                            obj[idx] = ~~item.count;
                            item.startTime = st;
                            item.endTime = et;
                            if (!item.count || !item.endTime || !item.startTime) {
                                return
                            }
                            productGetType_1(item);
                        } else {
                            productGetType_2(item);
                        }

                    }
                });
                reCount();
            };

            function reCount() {
                $scope.recount = Math.random() * 1000000000;
                $scope.$broadcast('recount');
            }

            function productGetType_2(item) {
                if (!item.count) {
                    return;
                }
                ibssUtils.api({
                    url: _APIs.cc_getAmount,
                    data: {
                        count: item.count,
                        productId: item.productId
                    }
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        $timeout(function() {
                            item.originalAmount = res.data.model.originalAmount;
                            item.purchaseTimeLength = res.data.model.purchaseTimeLength;
                        }, 100);
                    }
                });
            }

            function productGetType_1(item) {
                if (!item.count || !item.startTime || !item.endTime) {
                    return;
                }
                ibssUtils.api({
                    url: _APIs.cc_getAmount,
                    data: {
                        count: item.count,
                        endTime: item.endTime,
                        productId: item.productId,
                        startTime: item.startTime
                    }
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        if (item.discountConst) {
                            item.discountNum = item.discountConst;
                        } else {
                            item.originalAmount = res.data.model.originalAmount;
                            item.discountNum = res.data.model.discount / 10;
                        }
                        item.purchaseTimeLength = res.data.model.purchaseTimeLength;
                        $scope.getDiscount(item);
                    }
                }).then(function suc() {
                    getGived()
                });
            }

            $scope.countAmount = function() {
                $scope.detail.order.totalAmount = 0;
                $scope.detail.products.forEach(function(_product) {
                    if (_product.cur) {
                        $scope.detail.order.totalAmount += _product.amount;
                    }
                });
                if ($scope.detail.companyType) {
                    $scope.detail.order.agentReceivableAmount = ($scope.optionData && $scope.optionData[$scope.optionIndex || 0].order.amount) || 0;
                }
                $scope.detail.order.fsReceivableAmount = $scope.detail.order.totalAmount - $scope.detail.order.agentReceivableAmount;
                reCount()
            };
            $scope.getDiscount = function(item) {
                console.info(item)
                if (!item.amount || !item.originalAmount) {
                    return;
                }
                item.discount = (Math.floor((item.amount / item.originalAmount / item.discountNum) * 100) / 100);

                $scope.countAmount();
            };
            $scope.checkContract = function() {
                ibssUtils.api({
                    url: _APIs.od_checkContract + $scope.detail.contract.contractNo
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        if (res.data.model.length) {
                            $timeout(function() {
                                $scope.detail.contract.contractNo = '';
                            }, 500);
                            toaster.pop('error', '合同号已存在，请检查')
                        }
                    }
                });
            };

            function selectToPrd(item) {
                if (item.productParentType == 1 && item.cur == 1) {
                    $scope.showProduct = item.productParentId;
                    console.info(item)
                }
                switch (item.productParentId) {
                    case 5:
                        $scope.showOption = item.cur;
                        $scope.optionData = item.productDetails;
                        break;
                    case 6:
                        $scope.showSpace = item.cur;
                        $scope.spaceData = item.productDetails[0].order;
                        break;
                    case 7:
                        $scope.showTime = item.cur;
                        $scope.timeData = item.productDetails[0].order;
                        break;
                }
                $scope.getAmount();
            }

            function getGived() {
                var arr = [];
                $scope.detail.products.forEach(function(item) {
                    if (item.cur) {
                        if (item.cur && item.count && item.startTime && item.endTime) {
                            arr.push(item);
                        }
                    }
                });
                ibssUtils.api({
                    url: _APIs.cc_getGived,
                    data: {
                        subOrderDetails: arr,
                        whetherNewBuy: true
                    }
                }).then(function suc(res) {
                    if (res.data && res.data.success) {
                        res.data.model.forEach(function(item) {
                            item.unit = item.productId == 121 ? '小时' : 'G';
                        });
                        $scope.detail.gived = res.data.model;
                        $scope.detail.gived.forEach(function(j) {
                            $scope.detail.order.subOrders.forEach(function(i) {
                                if (j.productId == i.productId && i.gived) {
                                    i.count = j.count
                                }
                            });
                        });
                    }
                });
            }
            $scope.$on('datepicker.selectDay', function(a, b) {
                if (b.datepickerOptions.stop$emit) {
                    return;
                }
                $timeout(function() {
                    $scope.getAmount()
                }, 100);
            });
        }
    };
});