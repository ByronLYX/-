require('./index.less')
require('common/components/services/utils.js')
var viewTmpl = require('./view.tpl.html')

angular.module('ibss').directive('orderView', function($rootScope, toaster, AMser, ibssUtils, $timeout, customDialog) {
    return {
        restrict: 'E',
        scope: {
            detail: '=',
            approve: '=',
            flag: '=',
            boole: '='
        },
        template: viewTmpl,
        link: function($scope) {
            //companyType=1or2 - 直销用户不显示行业和公司规模
            $scope.hideForCompany = ($rootScope.companyType == 1 || $rootScope.companyType == 2);
            if (!$scope.detail.canUpdateSubOrder || $scope.detail.upgradeType === 2) {
                $scope.readonly = true;
            }
            if ($scope.detail.canUpdateSubOrder && $scope.detail.upgradeType === 0) {
                $scope.readonly = false;
            }
            if ($scope.detail.canUpdateContractAndAmount && $scope.detail.upgradeType === 1) {
                $scope.readonly = false;
                $scope.canUpdate = true;
            }
            if ($scope.flag) {
                $scope.readonly = true;
            }
            var orderId = $scope.detail.id;
            $scope.approve.dataProduct = {
                products: []
            };
            $scope.approve.dataPerformance = {};
            $scope.approve.dataCompany = {};
            $scope.approve.dataOther = {
                contractQualified: '',
                approvalOpinion: ''
            }
            var getPerformanceData = function() {
                ibssUtils.api({
                    url: _APIs.ck_getOrder + orderId
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        res.data.model.order.subOrders && res.data.model.order.subOrders.forEach(function(item) {
                            if (item.productParentName) {
                                var tag = false;
                                item.enterpriseAccount = res.data.model.order.enterpriseAccount;
                                item.cur = 1;
                                item.orderType = item.productId <= 100 ? 1 : 2;
                                item.originalST = item.startTime;
                                item.originalET = item.endTime;
                                item.productId = item.productId + '';
                                item.startTimeChanged = false;
                                item.endTimeChanged = false;
                                item.commissionSalers && item.commissionSalers.forEach(function(i) {
                                    item.isTitle = true;
                                    if (i.type == 2) {
                                        tag = true;
                                    }
                                });
                                if (tag) {
                                    item.isDouble = '2';
                                } else {
                                    item.isDouble = '1';
                                }
                                $scope.approve.dataProduct.products.push(item);
                            }
                        })
                        $scope.approve.dataProduct.order = res.data.model.order;
                        $scope.approve.dataProduct.order.id = orderId;
                        $scope.approve.dataProduct.contract = res.data.model.contract;
                        $scope.approve.dataProduct.contract.pics = [];
                        $scope.approve.dataProduct.order.signSubject = $scope.detail.signSubject
                            ? $scope.detail.signSubject + ''
                            : '';
                        var arr = res.data.model.contract.contractPics.split(',');
                        arr && arr.forEach(function(item) {
                            var obj = {
                                path: _APIs.picUrl + item,
                                src: item,
                                name: AMser.randomStr()
                            }
                            $scope.approve.dataProduct.contract.pics.push(obj);
                        });
                        $scope.approve.dataPerformance.remark = $scope.approve.dataProduct.order.remark;
                    }
                }).then(function suc() {
                    ibssUtils.api({
                        url: _APIs.cc_getProduct
                    }).then(function suc(res) {
                        if (res.data && res.data.success) {
                                // debugger
                            res.data.model.forEach(function(item) {
                                if (item.productParentId == 5) {
                                    $scope.approve.dataProduct.optionAmount = item.productDetails;
                                }
                            })
                        }
                    });
                });
            }

            var getCompanyData = function() {
                ibssUtils.api({
                    url: _APIs.ck_getCompany + orderId
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.approve.dataCompany.customerManagerName = res.data.model.customerManagerName;
                        $scope.approve.dataCompany.csmManagerName = res.data.model.csmManagerName;
                        $scope.approve.dataCompany.customerManager = res.data.model.customerManager;
                        $scope.approve.dataCompany.csmManager = res.data.model.csmManager;
                        $scope.approve.dataCompany.city = res.data.model.city;
                        $scope.approve.dataCompany.address = res.data.model.address;
                        $scope.approve.dataCompany.companyScale = '' + res.data.model.companyScale;
                        $scope.approve.dataCompany.contactEmail = res.data.model.contactEmail;
                        $scope.approve.dataCompany.contactName = res.data.model.contactName;
                        $scope.approve.dataCompany.contactPhone = res.data.model.contactPhone;
                        $scope.approve.dataCompany.contactPost = res.data.model.contactPost;
                        $scope.approve.dataCompany.enterpriseAccount = res.data.model.enterpriseAccount;
                        $scope.approve.dataCompany.enterpriseID = res.data.model.enterpriseID;
                        $scope.approve.dataCompany.enterpriseName = res.data.model.enterpriseName;
                        $scope.approve.dataCompany.groupType = '' + res.data.model.groupType;
                        $scope.approve.dataCompany.industry = res.data.model.industry;
                        $scope.approve.dataCompany.keyContactEmail = res.data.model.keyContactEmail;
                        $scope.approve.dataCompany.keyContactName = res.data.model.keyContactName;
                        $scope.approve.dataCompany.keyContactPhone = res.data.model.keyContactPhone;
                        $scope.approve.dataCompany.managerEmail = res.data.model.managerEmail;
                        $scope.approve.dataCompany.managerName = res.data.model.managerName;
                        $scope.approve.dataCompany.managerPhone = res.data.model.managerPhone;
                        $scope.approve.dataCompany.managerStatus = res.data.model.managerStatus;
                        $scope.approve.dataCompany.isMarking = '' + res.data.model.isMarking;
                        $scope.approve.dataCompany.isReferral = '' + res.data.model.isReferral;
                        $scope.approve.dataCompany.isSaleTeam = '' + res.data.model.isSaleTeam;
                        $scope.approve.dataCompany.saleTeamScale = '' + res.data.model.saleTeamScale;
                        $scope.approve.dataCompany.signEaName = res.data.model.signEaName;
                        $scope.approve.dataCompany.sacode = res.data.model.serviceArea[0];
                        $scope.approve.dataCompany.source = '' + res.data.model.source;
                        $timeout(function() {
                            $scope.$broadcast('writeByOutside');
                        }, 500);
                    }
                }).then(function serviceArea() {
                    ibssUtils.api({
                        url: _APIs.serviceArea
                    }).then(function suc(res) {
                        if (res.data && res.data.model) {
                            res.data.model.forEach(function(item) {
                                if (item.value == $scope.approve.dataCompany.sacode) {
                                    $scope.approve.dataCompany.serviceArea = item.name || '-';
                                } else {
                                    var obj = {},
                                        localData;
                                    ibssUtils.api({
                                        url: _APIs.localtion,
                                        method: 'POST'
                                    }).then(function(res) {
                                        if (res.data && res.data.success) {
                                            localData = res.data.model;
                                            localData && localData.forEach(function(t) {
                                                if ($scope.approve.dataCompany.sacode == t.value) {
                                                    obj.countyName = t.name;
                                                    if (t.parentValue == 0) {
                                                        obj.cityCode = null;
                                                        $scope.approve.dataCompany.serviceArea = obj.countyName;
                                                    } else {
                                                        obj.cityCode = t.parentValue
                                                    }
                                                    return;
                                                }
                                            });

                                            if (obj.cityCode) {
                                                localData.forEach(function(t) {
                                                    if (obj.cityCode == t.value) {
                                                        obj.cityName = t.name;
                                                        if (t.parentValue == 0) {
                                                            obj.provinceCode = null;
                                                            $scope.approve.dataCompany.serviceArea = obj.cityName + '-' + obj.countyName;
                                                        } else {
                                                            obj.provinceCode = t.parentValue
                                                        }
                                                        return;
                                                    }
                                                });
                                            }

                                            if (obj.provinceCode) {
                                                localData.forEach(function(t) {
                                                    if (obj.provinceCode == t.value) {
                                                        $scope.approve.dataCompany.serviceArea = t.name + '-' + obj.cityName + '-' + obj.countyName;
                                                        return;
                                                    }
                                                });
                                            }

                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            }

            var getOtherData = function() {
                var item = $scope.$parent.item
                ibssUtils.api({
                    url: _APIs.ca_queryreceivedpay + item.id,
                    method: 'POST'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.approve.dataOther.claimList = res.data.model
                    }
                })

                ibssUtils.api({
                    url: _APIs.ca_query_approval_log + item.id,
                    method: 'POST'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.approve.dataOther.approvalLog = res.data.model
                    }
                })

                //审批
                ibssUtils.api({
                    url: _APIs.ca_queryapprovalprocess + item.id,
                    method: 'POST'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.approve.dataOther.approvalList = res.data.model
                    }
                })
            }

            getPerformanceData()
            getCompanyData()
            getOtherData()

            $scope.$watch('recount', function() {
                if ($scope.readonly) {
                    return
                }
                if (!$scope.recount) {
                    return;
                }
            })

            //company
            $scope.checkAccount = function() {
                $scope.approve.dataCompany.checkAccount = false;
                var ACCOUNT = /^[a-zA-Z][a-zA-Z0-9_]{5,19}$/;
                if (!ACCOUNT.test($scope.approve.dataCompany.enterpriseAccount)) {
                    return;
                }
                ibssUtils.api({
                    url: _APIs.ep_checkAccount + $scope.approve.dataCompany.enterpriseAccount
                }).then(function suc(res) {
                    if (res.data && res.data.success) {
                        if (res.data.model) {
                            toaster.pop('error', '企业账号已被使用，请更换');
                        } else {
                            $scope.approve.dataCompany.checkAccount = true;
                        }
                    }
                });
            };

            $scope.chooseProducts = function(item, idx) {
                // alert('chooseProducts');
                // console.log(item);
                if ($scope.readonly) {
                    return;
                }
                var d = $scope.approve.dataProduct.products;
                var len = d.length;
                item.cur = !item.cur;
                if (item.productParentType !== 1 && item.productDetails && item.productDetails.length == 1) {
                    item.productDetails[0].cur = !item.productDetails[0].cur;
                }
                // debugger
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

            //计算实施费总额
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
                    $scope.countAmount(item);
                }, 100);
            };

            // 企业微信版支持的用户数规则：10、20、50、50+（仅可按10的整数倍增加）
            $scope.checkWeChat = function (data) {
                var flag = true;
                var count = data.count;
                var num = [10, 20, 50]

                if (count <= 50) {
                    !_.contains(num, count) && (flag = false);
                }
                else {
                    (count % 10 !== 0) && (flag = false);
                }

                return flag;
            };

            $scope.getAmount = function(item) {
                // debugger
                if (item) {
                    if (item.count == 0) {
                        toaster.pop('error', '用户数不能为0');
                        $timeout(function() {
                            item.count = '';
                        }, 1000);
                        return false;
                    }
                    if (item.productId < 100) {
                        if (!item.count || !item.endTime || !item.startTime || !item.cur) {
                            return
                        }
                        if (item.productParentId == 11 && !$scope.checkWeChat(item)) {
                            toaster.pop('error', '企业微信版支持的用户数规则：10、20、50、50+（仅可按10的整数倍增加）');
                            return;
                        }
                        productGetType_1(item);
                    } else {
                        productGetType_2(item);
                    }
                } else {
                    var obj = {};
                    $scope.approve.dataProduct.products.forEach(function(item) {
                        if (item.startTime && item.startTime != item.originalST || item.endTime && item.endTime != item.originalET || item.startTimeChanged || item.endTimeChanged) {
                            obj = item;
                            item.startTime && (item.startTimeChanged = item.startTime != item.originalST);
                            item.endTime && (item.endTimeChanged = item.endTime != item.originalET);
                            return;
                        }
                    });

                    if (obj.startTime > obj.endTime) {
                        toaster.pop('error', '开始时间不能大于结束时间');
                        return;
                    }

                    if (obj.productId < 100) {
                        productGetType_1(obj);
                    } else {
                        productGetType_2(obj);
                    }

                }

                // reCount();
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
                        productId: item.productId,
                        endTime: item.endTime,
                        startTime: item.startTime,
                        s1: AMser.getHumDate(item.startTime, ''),
                        e1: AMser.getHumDate(item.endTime, ''),
                    }
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        item.originalAmount = res.data.model.originalAmount;
                        item.discountNum = res.data.model.discount;
                        item.purchaseTimeLength = res.data.model.purchaseTimeLength; //购买时长
                        $scope.getDiscount(item);
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
                        startTime: item.startTime,
                        s1: AMser.getHumDate(item.startTime, ''),
                        e1: AMser.getHumDate(item.endTime, ''),
                    }
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        // if (item.discountConst) {
                        //     item.discountNum = item.discountConst;
                        // } else {
                        item.originalAmount = res.data.model.originalAmount;
                        item.discountNum = res.data.model.discount;
                        // item.discountNum = res.data.model.discount / 10;
                        // }
                        item.purchaseTimeLength = res.data.model.purchaseTimeLength; //购买时长
                        $scope.getDiscount(item);
                    }
                }).then(function suc() {
                    getGived()
                });
            }

            $scope.countAmount = function(item) {
                var amount = 0,
                    original = 0;
                if (item.commissionSalers.length > 0) {
                    item.commissionSalers = [];
                }
                if (item.isTitle) {
                    item.isTitle = false;
                }
                item.tip = item.amount;

                $scope.approve.dataProduct.order.totalAmount = 0;
                $scope.approve.dataProduct.products.forEach(function(_product) {
                    if (_product.cur) {
                        $scope.approve.dataProduct.order.totalAmount += _product.amount;
                    }
                });

                //代理商应收金额计算
                if (item.productId == 104 && ($scope.approve.dataProduct.order.companyType == 3 || $scope.approve.dataProduct.order.companyType == 4)) {
                    $scope.approve.dataProduct.order.agentReceivableAmount = item.amount;
                }

                //销客应收金额，总额-代理商
                $scope.approve.dataProduct.order.fsReceivableAmount = $scope.approve.dataProduct.order.totalAmount - $scope.approve.dataProduct.order.agentReceivableAmount;

                //综合折扣
                // $scope.approve.dataProduct.order.subOrders.forEach(function(item) {
                //     if (item.productId < 100) {
                //         amount += item.amount;
                //         original += (item.originalAmount * item.discountNum);
                //     }
                //     if (item.productId == 131 || item.productId == 151
                //         || item.productId == 152 || item.productId == 153
                //         || item.productId == 161 || item.productId == 171) {
                //         amount += item.amount;
                //         original += (item.originalAmount * item.discount);
                //     }
                // });

                // if (original) {
                //     if (amount) {
                //         var sum = (amount / original).toFixed(2);
                //         $scope.approve.dataProduct.order.discount = sum;
                //     }
                //     else if (amount === 0) {
                //         $scope.approve.dataProduct.order.discount = 0;
                //     }
                // }

                // reCount()


                $scope.approve.dataProduct.order.discount = discountHandle();
            };

            // 2018.1.1折扣算法
            function discountHandle() {
                // console.log($scope.approve.dataProduct.order.subOrders)
                // 产品原价总和
                var original = 0;
                // 合同金额总和
                var total = 0;
                // 协同购买数量
                var xtCount = 0;
                // 协同原价总和
                var xtOriginal = 0;
                // 协同合同金额总和
                var xtTotal = 0;
                // crm购买数量
                var crmCount = 0;
                // 协同购买数量是crm的三倍，大于三倍的协同，参与计算折扣
                var TIMES = 3;

                $scope.approve.dataProduct.order.subOrders.map(function (item) {
                    // 实施费、空间、培训助手课时、系统对接开发费不计算折扣
                    if (item.productId != 104
                        && item.productId != 111
                        && item.productId != 121
                        && item.productId != 301
                    ) {
                        if (item.productId == 51) {
                            xtCount = item.count;
                            xtOriginal = item.originalAmount;
                            xtTotal = item.amount;
                        }

                        // crm
                        if (item.productId == 12
                            || item.productId == 14
                            || item.productId == 15
                            || item.productId == 16) {
                            crmCount = item.count;
                        }

                        original += item.originalAmount;
                        total += item.amount;
                    }
                });

                if (xtCount && crmCount) {
                    var dis = xtCount - crmCount * TIMES;

                    if (dis > 0) {
                        var scale = 1 - dis / xtCount;

                        original = original - xtOriginal * scale;
                    }
                    else {
                        original = original - xtOriginal;
                    }
                }

                return original > 0 ? (total / original).toFixed(2) : 0;
            }

            //计算折扣
            $scope.getDiscount = function(item) {
                // if (!item.amount || !item.originalAmount) {
                if (!item.originalAmount) {
                    return;
                }
                // item.discount = (Math.floor((item.amount / item.originalAmount / item.discountNum) * 100) / 100);
                $scope.countAmount(item);
            };

            $scope.checkContract = function() {
                ibssUtils.api({
                    url: _APIs.od_checkContract + $scope.approve.dataProduct.contract.contractNo
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        if (res.data.model.length) {
                            $timeout(function() {
                                $scope.approve.dataProduct.contract.contractNo = '';
                            }, 500);
                            toaster.pop('error', '合同号已存在，请检查')
                        }
                    }
                });
            };

            //选择产品
            function selectToPrd(item) {
                // alert('selectToPrd');
                if (item.productParentType == 1 && item.cur == 1) {
                    $scope.showProduct = item.productParentId;
                }
            }

            //赠送
            function getGived() {
                var arr = [];
                $scope.approve.dataProduct.products.forEach(function(item) {
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
                        enterpriseAccount: $scope.detail.enterpriseAccount,
                        isUpdate: true
                    }
                }).then(function suc(res) {
                    if (res.data && res.data.success) {
                        res.data.model.forEach(function(item) {
                            item.unit = item.productId == 121 ? '小时' : 'G';
                        });
                        $scope.approve.dataProduct.gived = res.data.model;
                        $scope.approve.dataProduct.gived.forEach(function(j) {
                            $scope.approve.dataProduct.order.subOrders.forEach(function(i) {
                                if (j.productId == i.productId && i.gived) {
                                    i.count = j.count; //赋值新的订单
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

            //performance
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
                        product.isTitle = true;
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
                        product.commissionSalers.push(obj);
                        $scope.countComAmount(product, obj);
                    });
                }
            };

            //双计状态
            $scope.radioStatus = function(item) {
                if (item.isDouble == 1) {
                    item.tipDouble = '';
                    var arr = [];
                    if (item.commissionSalers.length) {
                        item.commissionSalers.forEach(function(item) {
                            if (item.type == 1) {
                                arr.push(item)
                            }
                        })
                        item.commissionSalers = arr;
                    }
                }
            };

            $scope.deleteEmployee = function(item, employee) {
                var idx = 0;
                var count = 0;
                item.commissionSalers.forEach(function(i, index) {
                    if (i.accountId == employee.accountId) {
                        idx = index;
                    }
                });
                item.commissionSalers.splice(idx, 1);
                $scope.countComAmount(item, employee);
                item.commissionSalers.forEach(function(item) {
                    if (item.type == 2) {
                        count += 1;
                    }
                });
                if (!count) {
                    item.isDouble = 1;
                }
                item.isTitle = false;
            };

            //计算绩效
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
                item.commissionSalers.forEach(function(i) {
                    if (i.type == type) {
                        amount += i.amount || 0;
                    }
                });
                if (amount < item.amount) {
                    if (type == 1) { //标准绩效
                        item.tip = +(item.amount - amount).toFixed(2);
                    } else { //双计绩效
                        item.tipDouble = +(item.amount - amount).toFixed(2);
                    }
                }
                if (amount == item.amount) {
                    if (type == 1) {
                        item.tip = 0;
                    } else {
                        item.tipDouble = 0;
                    }
                }
                if (amount > item.amount) {
                    toaster.pop('error', '绩效总额不能大于收款金额');
                    $timeout(function() {
                        employee.amount = '';
                    }, 500);
                }
            };

            $scope.handleAmount = function (number) {

                if (number < 0) {
                    return 0
                }

                var n = number.toString();

                if (n.indexOf('.') > -1
                    && n.split('.')[1].length > 2) {
                    return +number.toFixed(2);
                }

                return number;
            }

            $scope.fsReceivableChange = function () {
                if (typeof $scope.approve.dataProduct.order.fsReceivableAmount === 'number') {
                    $scope.approve.dataProduct.order.fsReceivableAmount
                     = $scope.handleAmount($scope.approve.dataProduct.order.fsReceivableAmount);
                }
            };

            $scope.agentReceivableChange = function () {
                // debugger
                if (typeof $scope.approve.dataProduct.order.agentReceivableAmount === 'number') {
                    $scope.approve.dataProduct.order.agentReceivableAmount
                     = $scope.handleAmount($scope.approve.dataProduct.order.agentReceivableAmount);
                }
            };

            //other
            $scope.getCause = function(n) {
                $scope.approve.dataOther.approvalOpinion = n;
            }

            $scope.preview = {
                src: '',
                show: 0,
                rotate: 0
            }

        }
    }
});