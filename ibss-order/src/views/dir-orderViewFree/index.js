require('./index.less')
require('common/components/services/utils.js')
var viewTmpl = require('./view.tpl.html')

angular.module('ibss').directive('orderViewFree', function($rootScope, toaster, AMser, ibssUtils, $timeout) {
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
            var orderId = $scope.detail.id;
            $scope.approve.dataProduct = {
                companyType: ($rootScope.companyType !== 1),
                products: []
            };
            $scope.approve.dataPerformance = {};
            $scope.approve.dataCompany = {};
            $scope.approve.dataOther = {
                contractQualified: '',
                approvalOpinion: ''
            }

            var getPerformanceFree = function() {
                ibssUtils.api({
                    url: _APIs.ca_freeorder_queryfreeOrder + orderId
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        let sourceItem = {
                            sourceArr: []
                        };
                        res.data.model.order.subOrders && res.data.model.order.subOrders.forEach(function(item) {
                            if (item.productParentName) {

                                if (item.productId <= 250 && item.productId >= 201) {

                                    sourceItem.sourceArr.push(item);


                                    sourceItem.cur = 1;
                                    sourceItem.orderType = 2;
                                    sourceItem.productParentName = '资源扩展包';
                                    sourceItem.startTime = item.startTime;
                                    sourceItem.endTime = item.endTime;
                                    if (item.startTime) {
                                        sourceItem.startTimeStr = AMser.getHumDate(item.startTime, '');
                                        sourceItem.endTimeStr = AMser.getHumDate(item.endTime, '');
                                    }
                                    sourceItem.originalST = item.startTime;
                                    sourceItem.originalET = item.endTime;


                                } else {
                                    item.cur = 1;
                                    item.orderType = item.productId <= 100 ? 1 : 2;
                                    if (item.startTime) {
                                        item.startTimeStr = AMser.getHumDate(item.startTime, '');
                                        item.endTimeStr = AMser.getHumDate(item.endTime, '');
                                    }
                                    item.originalST = item.startTime;
                                    item.originalET = item.endTime;
                                    item.productId = item.productId + '';
                                    $scope.approve.dataProduct.products.push(item);
                                }


                            }
                        })
                        if (sourceItem.cur) {
                            $scope.approve.dataProduct.products.push(sourceItem);
                        }
                        $scope.approve.dataProduct.order = res.data.model.order;
                        $scope.approve.dataProduct.order.id = orderId;
                    }
                }).then(function suc() {
                    ibssUtils.api({
                        url: _APIs.cc_getProduct
                    }).then(function suc(res) {
                        if (res.data && res.data.success) {
                            res.data.model && res.data.model.forEach(function(item) {
                                if (item.productParentId == 5) {
                                    $scope.approve.dataProduct.optionAmount = item.productDetails;
                                }
                            })
                        }
                    });
                });
            }

            var getCompanyFree = function() {
                ibssUtils.api({
                    url: _APIs.cc_getEpsEa + $scope.detail.enterpriseAccount
                }).then(function(res) {
                    ibssUtils.api({
                        url: _APIs.cc_getEpsOpened + res.data.model.ei,
                    }).then(function(res) {
                        if (res.data && res.data.success) {
                            $scope.approve.dataCompany.customerManagerName = res.data.model.customerManagerName;
                            $scope.approve.dataCompany.csmManagerName = res.data.model.csmManagerName;
                            $scope.approve.dataCompany.customerManager = res.data.model.customerManager;
                            $scope.approve.dataCompany.csmManager = res.data.model.csmManager;
                            $scope.approve.dataCompany.city = res.data.model.cityCode; //企业地址
                            $scope.approve.dataCompany.address = res.data.model.address; //企业地址
                            $scope.approve.dataCompany.companyScale = '' + res.data.model.companySizeId; //公司规模
                            $scope.approve.dataCompany.contactEmail = res.data.model.contactEmail;
                            $scope.approve.dataCompany.contactName = res.data.model.contactName;
                            $scope.approve.dataCompany.contactPhone = res.data.model.contactPhone;
                            $scope.approve.dataCompany.contactPost = res.data.model.contactPost;
                            $scope.approve.dataCompany.enterpriseAccount = res.data.model.ea; //企业账号
                            $scope.approve.dataCompany.enterpriseID = res.data.model.enterpriseID;
                            $scope.approve.dataCompany.enterpriseName = res.data.model.name; //当前企业名称
                            $scope.approve.dataCompany.groupType = '' + res.data.model.userGroupId; //使用对象类型
                            $scope.approve.dataCompany.industry = res.data.model.industryCode; //行业
                            $scope.approve.dataCompany.keyContactEmail = res.data.model.contacts[0].email; //企业负责人邮箱
                            $scope.approve.dataCompany.keyContactName = res.data.model.contacts[0].name; //企业负责人姓名
                            $scope.approve.dataCompany.keyContactPhone = res.data.model.contacts[0].phone; //企业负责人手机
                            $scope.approve.dataCompany.managerEmail = ''; //平台管理员邮箱
                            $scope.approve.dataCompany.managerName = ''; //平台管理员姓名
                            $scope.approve.dataCompany.managerPhone = ''; //平台管理员手机
                            $scope.approve.dataCompany.managerStatus = res.data.model.managerStatus;
                            $scope.approve.dataCompany.isMarking = '' + res.data.model.isSample; //是否标杆
                            $scope.approve.dataCompany.isReferral = '' + res.data.model.isIntroduced; //是否转介绍
                            $scope.approve.dataCompany.isSaleTeam = '' + res.data.model.hasSales; //销售团队使用
                            $scope.approve.dataCompany.saleTeamScale = '' + res.data.model.salesSizeId; //销售团队规模
                            $scope.approve.dataCompany.areaCode = res.data.model.areaCode; //服务区域
                            $scope.approve.dataCompany.signEaName = res.data.model.registeredName; //签约企业名称
                            $scope.approve.dataCompany.source = '' + res.data.model.sourceId; //来源
                            $timeout(function() {
                                $scope.$broadcast('writeByOutside');
                            }, 500);
                        }
                    }).then(function serviceArea() {
                        ibssUtils.api({
                            url: _APIs.serviceArea
                        }).then(function suc(res) {
                            if (res.data && res.data.model) {
                                res.data.model && res.data.model.forEach(function(item) {
                                    if (item.value == $scope.approve.dataCompany.sacode) {
                                        $scope.approve.dataCompany.serviceArea = item.name || '-';
                                    } else {
                                        $scope.approve.dataCompany.serviceArea = '-';
                                    }
                                })
                            }
                        });
                    });
                });
            }

            var getOtherFree = function() {
                var item = $scope.$parent.item

                //审批
                ibssUtils.api({
                    url: _APIs.ca_freeorderapr_auditdetail + item.id,
                    method: 'POST'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        $scope.approve.dataOther.approvalList = res.data.model
                    }
                })

            }

            // 查询免费单合同信息
            function getContractFree () {
                // debugger
                if ($scope.detail.orderType !== 3) {
                    return;
                }

                ibssUtils.api({
                    url: _APIs.od_query_freeordercontract + orderId,
                    method: 'POST'
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        var model = res.data.model;

                        $scope.approve.dataProduct.contract.pics = [];
                        var arr = model.contractPics.split(',');
                        arr && arr.forEach(function(item) {
                            var obj = {
                                path: _APIs.picUrl + item,
                                src: item,
                                name: AMser.randomStr()
                            }
                            $scope.approve.dataProduct.contract.pics.push(obj);
                        });

                        $scope.approve.dataProduct.contract.sealName = model.sealName;
                    }
                })
            }

            getCompanyFree();
            getPerformanceFree();
            getOtherFree();
            getContractFree();

            $scope.$on('datepicker.selectDay', function(a, b) {
                if (b.datepickerOptions.stop$emit) {
                    return;
                }
                $timeout(function() {
                    $scope.getAmount()
                }, 100);
            });

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

            //product
            $scope.chooseProducts = function(item, idx) {
                if ($scope.flag) {
                    return;
                }
                var d = $scope.approve.dataProduct.products;
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
                $scope.approve.dataProduct.products.forEach(function(product) {
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
                    case 8:
                        $scope.showConnect = item.cur;
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
            $scope.getAmount = function(item) {

                if (item) {
                    if (item.count == 0) {
                        toaster.pop('error', '用户数不能为0');
                        $timeout(function() {
                            item.count = '';
                        }, 1000);
                        return false;
                    }
                    if (item.productId < 100) {
                        if (!item.count || !item.endTime || !item.startTime) {
                            return
                        }
                        productGetType_1(item);
                    } else {
                        productGetType_2(item);
                    }
                } else {
                    var obj = {};
                    $scope.approve.dataProduct.products.forEach(function(item) {
                        if (item.startTime && item.startTime != item.originalST || item.endTime && item.endTime != item.originalET) {
                            obj = item;
                            return;
                        }
                    });

                    if (obj.startTime > obj.endTime) {
                        toaster.pop('error', '开始时间不能大于结束时间');
                        return;
                    }
                    var days = (obj.endTime + (24 * 3600) - obj.startTime) / (24 * 3600 * 1000);
                    if (days > 45 && $scope.detail.orderType == 2) {
                        toaster.pop('error', '试用时长不可超过45天');
                        $timeout(function() {
                            obj.endTime = '';
                        }, 1000);
                        return false;
                    }

                    if (obj.productParentName !== '资源扩展包') {
                        if (obj.productId < 100) {
                            productGetType_1(obj);
                        } else {
                            productGetType_2(obj);
                        }
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
                // ibssUtils.api({
                //     url: _APIs.cc_getAmount,
                //     data: {
                //         count: ~~item.count,
                //         productId: item.productId
                //     }
                // }).then(function success(res) {
                //     if (res.data && res.data.success) {
                //         $timeout(function () {
                //             item.originalAmount = res.data.model.originalAmount;
                //             item.purchaseTimeLength = res.data.model.purchaseTimeLength;
                //             debugger
                //         }, 100);
                //     }
                // });


                ibssUtils.api({
                    url: _APIs.cc_getAmount,
                    data: {
                        count: item.count,
                        productId: item.productId,
                        endTime: item.endTime,
                        startTime: item.startTime
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
                        startTime: item.startTime
                    }
                }).then(function success(res) {
                    if (res.data && res.data.success) {
                        item.originalAmount = res.data.model.originalAmount;
                        item.purchaseTimeLength = res.data.model.purchaseTimeLength;
                        item.discount = res.data.model.discount / 10;
                        $scope.getDiscount(item);
                    }
                });
                // .then(function suc() {
                //     getGived()
                // });
            }


            $scope.countAmount = function() {

                $scope.approve.dataProduct.order.totalAmount = 0;
                $scope.approve.dataProduct.products.forEach(function(_product) {
                    if (_product.cur) {
                        $scope.approve.dataProduct.order.totalAmount += _product.amount;
                    }
                });
                if ($scope.approve.dataProduct.companyType) {
                    $scope.approve.dataProduct.order.agentReceivableAmount = ($scope.optionData && $scope.optionData[$scope.optionIndex || 0].order.amount) || 0;
                }
                $scope.approve.dataProduct.order.fsReceivableAmount = $scope.approve.dataProduct.order.totalAmount - $scope.approve.dataProduct.order.agentReceivableAmount;
                // reCount()
            };
            $scope.getDiscount = function(item) {
                if (!item.amount || !item.originalAmount) {
                    return;
                }
                item.discount = (Math.floor((item.amount / item.originalAmount / item.discountNum) * 100) / 100);
                $scope.countAmount();
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

            function selectToPrd(item) {
                if (item.productParentType == 1 && item.cur == 1) {
                    $scope.showProduct = item.productParentId;
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
                switch (item.productId) {
                    case 131: //企业互联
                        $scope.showConnect = item.cur;
                        $scope.connectData = item.productDetails[0].order;
                        break;
                }
                $scope.getAmount(item);
            }

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
                    }
                });
            }

            //other
            $scope.getCause = function(n) {
                $scope.approve.dataOther.approvalOpinion = n
            }

            $scope.preview = {
                src: '',
                show: 0,
                rotate: 0
            }

        }


    }

});