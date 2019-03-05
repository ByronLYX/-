require('./index.less')
require('../dir-orderView')
require('../dir-orderViewFree')

angular.module('ibss').controller('orderAuditController', function($scope, customDialog, ibssUtils, toaster) {
    $scope.tabType = 1
    $scope.tabStatus = 1
    $scope.freeType = 0

    var paginationData = {
        totals: 0,
        currentPage: 1,
        maxSize: 10,
        itemsPerPage: 20
    }

    var handleBuyData = function(data) {
        data.map(function(item) {
            if (item.upgradeType === 0) {
                item.upgradeTypeText = '标准订单'
            } else if (item.upgradeType === 1) {
                item.upgradeTypeText = '版本升级'
            } else if (item.upgradeType === 2) {
                item.upgradeTypeText = '账号升级'
            } else {
                item.upgradeTypeText = '-'
            }

            if (item.approvalType === 1) {
                item.approvalTypeText = '订单'
            } else if (item.approvalType === 2) {
                item.approvalTypeText = '补充合同'
            } else {
                item.approvalTypeText = '-'
            }

            if (item.orderStatus === 1) {
                item.orderStatusText = '标准订单'
            } else if (item.orderStatus === 2) {
                item.orderStatusText = '版本升级'
            } else if (item.orderStatus === 3) {
                item.orderStatusText = '账号升级'
            } else {
                item.orderStatusText = '-'
            }

            if (item.csmManager) {
                item.csmManagerName = item.csmManager.substring(0, item.csmManager.indexOf('-'))
                item.csmManagerDept = item.csmManager.substring(item.csmManager.indexOf('-') + 1)
            }

            if (item.customerManager) {
                item.customerManagerName = item.customerManager.substring(0, item.customerManager.indexOf('-'))
                item.customerManagerDept = item.customerManager.substring(item.customerManager.indexOf('-') + 1)
            }
        })
        return data
    }

    var initBase = function() {
        $scope.base = {
            enterpriseName: '',
            enterpriseAccount: '',
            orderId: '',
            contractNo: '',
            payerName: '',
            upgradeType: '',
            orderStatus: '',
            approvalType: '',
            startTime: '',
            endTime: ''
        }
    }

    var queryBuyList = function(force) {
        var url
        $scope.paginationData = paginationData
        switch ($scope.tabType) {
            case 1:
                url = _APIs.ca_orderapproval_queryunauditedpage
                break
            case 2:
                url = _APIs.ca_orderapproval_queryauditedpage
                break
        }
        ibssUtils.api({
            url: url,
            method: 'POST',
            data: {
                enterpriseName: $scope.base.enterpriseName,
                enterpriseAccount: $scope.base.enterpriseAccount,
                orderId: $scope.base.orderId,
                contractNo: $scope.base.contractNo,
                payerName: $scope.base.payerName,
                upgradeType: $scope.base.upgradeType,
                orderStatus: $scope.base.orderStatus,
                approvalType: $scope.base.approvalType,
                startTime: $scope.base.startTime,
                endTime: $scope.base.endTime,
                pageIndex: force ? 1 : $scope.paginationData.currentPage,
                pageSize: $scope.paginationData.itemsPerPage
            }
        }).then(function(res) {
            if (res.data && res.data.success) {
                var data = handleBuyData(res.data.model.content)
                $scope.orderList = data
                $scope.paginationData.totals = res.data.model.itemCount
                $scope.paginationData.currentPage = res.data.model.pageIndex
            } else {
                $scope.orderList = []
                $scope.paginationData.totals = 0
                $scope.paginationData.currentPage = 0
            }
        })
    }

    initBase()
    queryBuyList(true)

    $scope.queryBuyOrder = function() {
        queryBuyList(true)
    }

    $scope.handleBuyCheck = function(item) {
        customDialog.open({
            title: '查看',
            content: '<div><order-view detail="item" approve="approve" flag="flag" boole="boole"></order-view></div>',
            size: 'lg',
            hideFooter: true,
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = true
                dialogScope.boole = false
            }
        })

        // ibssUtils.sendLog({
        //     operationId: 'view',
        //     eventData: {
        //         type: 'view'
        //     }
        // });
    }

    $scope.handleBuyModify = function(item) {
        customDialog.open({
            title: '修改',
            content: '<div><order-view detail="item" approve="approve" flag="flag" boole="boole"></order-view></div>',
            size: 'lg',
            enterText: '提交',
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = false
                dialogScope.boole = false
            },
            okCallback: function(e) {
                var contract = e.approve.dataProduct.contract,
                    commission = e.approve.dataProduct.products,
                    dataOrder = e.approve.dataProduct.order,
                    pics = [],
                    flag = false,
                    timeFlag = false;

                e.approve.dataProduct.order.remark = e.approve.dataPerformance.remark;
                e.approve.dataProduct.order.signSubject = +e.approve.dataProduct.order.signSubject || '';
                var arr = [];
                e.approve.dataProduct.order.subOrders.forEach(function(item) {
                    if (item.cur) {
                        arr.push(item)
                    }
                });
                e.approve.dataProduct.order.subOrders = arr;
                contract.pics.map(function(pic) {
                    pics.push(pic.src)
                })

                contract.contractPics = pics.join(',')

                commission && commission.map(function(item) {

                    // 有未分配的绩效
                    if (item.tip || item.tipDouble) {
                        flag = true;
                    }

                    // 非赠送产品
                    if (!item.gived) {
                        // 绩效信息为空
                        if (item.commissionSalers.length == 0) {
                            flag = true;
                        }

                        // 绩效金额为空或null
                        item.commissionSalers.map(function (commItem) {
                            if (commItem.amount === '' || commItem.amount === null) {
                                flag = true;
                            }
                        });
                    }

                    if (item.startTime && item.endTime && item.startTime > item.endTime) {
                        timeFlag = true
                    }
                })

                if (flag) {
                    toaster.pop('error', null, '绩效金额没有分配完成', 3000)
                    return false
                }

                if (timeFlag) {
                    toaster.pop('error', '开始时间不能大于结束时间')
                    return false
                }

                if (!handleAmount(dataOrder)) {
                    toaster.pop('error', '总部应收款金额与代理商应收款金额之和，应等于合同总金额');
                    return false;
                }

                ibssUtils.api({
                    url: _APIs.ca_order_update,
                    method: 'POST',
                    data: {
                        contract: e.approve.dataProduct.contract,
                        order: e.approve.dataProduct.order
                    }
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        queryBuyList(true)
                        toaster.pop('success', null, '修改成功!', 3000)
                    } else {
                        toaster.pop('error', null, '修改失败!', 3000)

                    }
                })

            }

        })

        // ibssUtils.sendLog({
        //     operationId: 'edit',
        //     eventData: {
        //         type: 'edit'
        //     }
        // });
    }

    function handleAmount(data) {
        
        var amount = +(data.fsReceivableAmount + data.agentReceivableAmount).toFixed(2);

        if (amount !== data.totalAmount) {
            return false;
        }

        return true;
    }

    $scope.handleBuyAudit = function(item) {
        customDialog.open({
            title: '审核',
            content: '<div><order-view detail="item" approve="approve" flag="flag" boole="boole"></order-view></div>',
            size: 'lg',
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = false
                dialogScope.boole = true
            },
            okCallback: function(e) {
                
                var contract = e.approve.dataProduct.contract,
                    commission = e.approve.dataProduct.products,
                    dataOther = e.approve.dataOther,
                    dataOrder = e.approve.dataProduct.order,
                    pics = [],
                    contractPics = [],
                    flag = false,
                    timeFlag = false;

                e.approve.dataProduct.order.remark = e.approve.dataPerformance.remark;
                var arr = [];
                e.approve.dataProduct.order.subOrders.forEach(function(item, idx) {
                    if (item.cur) {
                        arr.push(item)
                    }
                });
                e.approve.dataProduct.order.subOrders = arr;
                e.approve.dataProduct.order.signSubject = +e.approve.dataProduct.order.signSubject || '';

                contract.pics.map(function(pic) {
                    pics.push(pic.src)
                })

                contract.contractPics = pics.join(',')

                commission && commission.map(function(item) {
                    // 有未分配的绩效
                    if (item.tip || item.tipDouble) {
                        flag = true;
                    }

                    // 非赠送产品
                    if (!item.gived) {
                        // 绩效信息为空
                        if (item.commissionSalers.length == 0) {
                            flag = true;
                        }

                        // 绩效金额为空或null
                        item.commissionSalers.map(function (commItem) {
                            if (commItem.amount === '' || commItem.amount === null) {
                                flag = true;
                            }
                        });
                    }

                    if (item.startTime && item.endTime && item.startTime > item.endTime) {
                        timeFlag = true
                    }
                })

                if (flag) {
                    toaster.pop('error', null, '绩效金额没有分配完成', 3000)
                    return false
                }

                if (timeFlag) {
                    toaster.pop('error', '开始时间不能大于结束时间')
                    return false
                }

                if (!handleAmount(dataOrder)) {
                    toaster.pop('error', '总部应收款金额与代理商应收款金额之和，应等于合同总金额');
                    return false;
                }

                if (dataOther.contractQualified == '') {
                    toaster.pop('error', null, '合同未审核', 3000)
                    return false
                }

                if (!item.canUpdateContractAndAmount && !item.canUpdateSubOrder) {
                    ibssUtils.api({
                        url: _APIs.ca_odrapproval_create,
                        method: 'POST',
                        data: {
                            approvalOpinion: dataOther.approvalOpinion,
                            approvalPics: contractPics.toString(),
                            contractQualified: dataOther.contractQualified,
                            orderId: item.id
                        }
                    }).then(function(res) {
                        if (res.data && res.data.success) {
                            queryBuyList(true)
                            toaster.pop('success', null, '审核成功!', 3000)
                        } else {
                            toaster.pop('error', null, '审核失败!', 3000)
                        }
                    })
                }

                if (item.canUpdateContractAndAmount || item.canUpdateSubOrder) {
                    ibssUtils.api({
                        url: _APIs.ca_order_update,
                        method: 'POST',
                        data: {
                            contract: e.approve.dataProduct.contract,
                            order: e.approve.dataProduct.order
                        }
                    }).then(function(res) {
                        if (res.data && res.data.success) {
                            ibssUtils.api({
                                url: _APIs.ca_odrapproval_create,
                                method: 'POST',
                                data: {
                                    approvalOpinion: dataOther.approvalOpinion,
                                    approvalPics: contractPics.toString(),
                                    contractQualified: dataOther.contractQualified,
                                    orderId: item.id
                                }
                            }).then(function(res) {
                                if (res.data && res.data.success) {
                                    queryBuyList(true)
                                    toaster.pop('success', null, '审核成功!', 3000)
                                } else {
                                    toaster.pop('error', null, '审核失败!', 3000)
                                }
                            })
                        } else {
                            toaster.pop('error', null, '审核失败!', 3000)
                        }
                    })
                }

            }
        })

        // ibssUtils.sendLog({
        //     operationId: 'approve',
        //     eventData: {
        //         type: 'approve'
        //     }
        // });
    }

    $scope.handleBuyDelete = function(item) {
        if (confirm("确定要删除吗?")) {
            ibssUtils.api({
                url: _APIs.ca_order_delete + item.id,
                method: 'POST',
            }).then(function(res) {
                if (res.data && res.data.success) {
                    queryBuyList(true)
                    toaster.pop('success', null, '删除成功!', 3000)
                }
            })

            // ibssUtils.sendLog({
            //     operationId: 'del',
            //     eventData: {
            //         type: 'del'
            //     }
            // });
        }
    }

    //免费审核订单
    var handleFreeData = function(data) {
        data.map(function(item) {
            if (item.csmManager) {
                item.csmManagerName = item.csmManager.substring(0, item.csmManager.indexOf('-'))
                item.csmManagerDept = item.csmManager.substring(item.csmManager.indexOf('-') + 1)
            }

            if (item.customerManager) {
                item.customerManagerName = item.customerManager.substring(0, item.customerManager.indexOf('-'))
                item.customerManagerDept = item.customerManager.substring(item.customerManager.indexOf('-') + 1)
            }
        })
        return data
    }

    var queryFreeList = function(force) {
        var url
        $scope.paginationData = paginationData
        switch ($scope.tabType) {
            case 1:
                url = _APIs.ca_freeorderapr_queryunauditedpage
                break
            case 2:
                url = _APIs.ca_freeorderapr_queryauditedpage
                break
        }
        ibssUtils.api({
            url: url,
            method: 'POST',
            data: {
                enterpriseName: $scope.base.enterpriseName,
                enterpriseAccount: $scope.base.enterpriseAccount,
                id: $scope.base.orderId,
                startTime: $scope.base.startTime,
                endTime: $scope.base.endTime,
                type: $scope.freeType,
                pageIndex: force ? 1 : $scope.paginationData.currentPage,
                pageSize: $scope.paginationData.itemsPerPage
            }
        }).then(function(res) {
            if (res.data && res.data.success) {
                var data = handleFreeData(res.data.model.content)
                $scope.orderList = data
                $scope.paginationData.totals = res.data.model.itemCount
                $scope.paginationData.currentPage = res.data.model.pageIndex
            } else {
                $scope.orderList = []
                $scope.paginationData.totals = 0
                $scope.paginationData.currentPage = 0
            }
        })
    }

    $scope.queryFreeOrder = function() {
        queryFreeList(true)
    }

    $scope.handleFreeCheck = function(item) {
        item.orderType = $scope.tabStatus;
        customDialog.open({
            title: '查看',
            content: '<div><order-view-free detail="item" approve="approve" flag="flag" boole="boole"></order-view-free></div>',
            size: 'lg',
            hideFooter: true,
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = true
                dialogScope.boole = false
            }
        })

    }

    $scope.handleFreeAudit = function(item) {
        item.orderType = $scope.tabStatus;
        customDialog.open({
            title: '审核',
            content: '<div><order-view-free detail="item" approve="approve" flag="flag" boole="boole"></order-view-free></div>',
            size: 'lg',
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = false
                dialogScope.boole = true
            },
            okCallback: function(e) {
                var pics = [],
                    contractPics = [],
                    contract = e.approve.dataProduct.contract,
                    commission = e.approve.dataProduct.products,
                    dataOther = e.approve.dataOther,
                    timeFlag = false,
                    endTimeFlag = false,
                    countFlag = false;

                contract.pics.map(function(pic) {
                    pics.push(pic.src)
                })

                contract.contractPics = pics.join(',')

                commission && commission.map(function(comm) {

                    if (comm.count == 0) {
                        countFlag = true;
                    }

                    if (comm.productId !== "121" && comm.productId !== "111") {
                        if (comm.startTime && comm.endTime && comm.startTime > comm.endTime) {
                            timeFlag = true
                        }
                        if (!comm.endTime) {
                            endTimeFlag = true
                        }
                    }
                })

                if (countFlag) {
                    toaster.pop('error', comm.productParentName + '数量不能为0');
                    return false;
                }
                
                if (timeFlag) {
                    toaster.pop('error', '开始时间不能大于结束时间');
                    return false;
                }

                if (endTimeFlag) {
                    toaster.pop('error', '结束时间不能为空');
                    return false;
                }

                if (item.orderType === 3
                    && dataOther.contractQualified == '') {
                    toaster.pop('error', '合同未审核');
                    return false;
                }

                ibssUtils.api({
                    url: _APIs.ca_freeorder_update,
                    method: 'POST',
                    data: {
                        contract: e.approve.dataProduct.contract,
                        order: e.approve.dataProduct.order
                    }
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        ibssUtils.api({
                            url: _APIs.ca_freeorderapr_create,
                            method: 'POST',
                            data: {
                                approvalOpinion: e.approve.dataOther.approvalOpinion,
                                approvalPics: contractPics.toString(),
                                contractQualified: e.approve.dataOther.contractQualified,
                                orderId: item.id
                            }
                        }).then(function(res) {
                            if (res.data && res.data.success) {
                                queryFreeList(true)
                                toaster.pop('success', null, '审核成功!', 3000)
                            } else {
                                toaster.pop('error', null, '审核失败!', 3000)
                            }
                        })
                    } else {
                        toaster.pop('error', null, '审核失败!', 3000)
                    }
                })

            }

        })
    }

    $scope.handleFreeModify = function(item) {
        item.orderType = $scope.tabStatus;
        customDialog.open({
            title: '修改',
            content: '<div><order-view-free detail="item" approve="approve" flag="flag" boole="boole"></order-view-free></div>',
            size: 'lg',
            enterText: '提交',
            ctrl: function(dialogScope) {
                dialogScope.item = item
                dialogScope.approve = {}
                dialogScope.flag = false
                dialogScope.boole = false
            },
            okCallback: function(e) {
                var commission = e.approve.dataProduct.products,
                    contract = e.approve.dataProduct.contract,
                    pics = [],
                    timeFlag = false,
                    countFlag = false;

                commission && commission.map(function(item) {
                    if (item.count == 0) {
                        toaster.pop('error', item.productParentName + '数量不能为0');
                        countFlag = true;
                    }
                    if (item.productId !== "121" && item.productId !== "111") {
                        if (item.startTime && item.endTime && item.startTime > item.endTime) {
                            toaster.pop('error', '开始时间不能大于结束时间');
                            timeFlag = true
                        }
                        if (!item.endTime) {
                            toaster.pop('error', '结束时间不能为空');
                            timeFlag = true
                        }
                    }
                })
                if (timeFlag || countFlag) {
                    return false
                }

                var data = {
                    order: e.approve.dataProduct.order
                };

                contract.pics.map(function(pic) {
                    pics.push(pic.src)
                })

                contract.contractPics = pics.join(',')

                if (item.orderType === 3) {
                    data.contract = contract;
                }

                ibssUtils.api({
                    url: _APIs.ca_freeorder_update,
                    method: 'POST',
                    data: data
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        queryFreeList(true)
                        toaster.pop('success', null, '修改成功!', 3000)
                    } else {
                        toaster.pop('error', null, '修改失败!', 3000)
                    }
                })

            }

        })
    }

    $scope.handleFreeDelete = function(item) {
        if (confirm("确定要删除吗?")) {
            ibssUtils.api({
                url: _APIs.ca_freeorder_delete + item.id,
                method: 'POST'
            }).then(function(res) {
                if (res.data && res.data.success) {
                    queryFreeList(true)
                    toaster.pop('success', null, '删除成功!', 3000)
                }
            })
        }
    }

    $scope.handleType = function(n) {
        switch (n) {
            case 1:
                $scope.tabType = 1
                $scope.tabStatus = 1
                initBase()
                queryBuyList(true)
                break
            case 2:
                $scope.tabType = 2
                $scope.tabStatus = 1
                initBase()
                queryBuyList(true)
                break
        }
    }

    $scope.handleClick = function(n) {
        switch (n) {
            case 1:
                $scope.tabStatus = 1
                initBase()
                queryBuyList(true)
                break
            case 2:
                $scope.tabStatus = 2
                $scope.freeType = 1
                initBase()
                queryFreeList(true)
                break
            case 3:
                $scope.tabStatus = 3
                $scope.freeType = 2
                initBase()
                queryFreeList(true)
                break
        }
    }

    $scope.pageChanged = function() {
        if ($scope.tabStatus === 1) {
            queryBuyList(false)
        } else {
            queryFreeList(false)
        }
    }

    $scope.changePageNum = function(n) {
        if (n) {
            paginationData.itemsPerPage = n
        } else {
            paginationData.itemsPerPage = 20
        }

        if ($scope.tabStatus === 1) {
            queryBuyList(true)
        } else {
            queryFreeList(true)
        }
    }

    $scope.clearQuery = function() {
        $scope.base.enterpriseName = ''
        $scope.base.enterpriseAccount = ''
        $scope.base.orderId = ''
        $scope.base.contractNo = ''
        $scope.base.payerName = ''
        $scope.base.upgradeType = ''
        $scope.base.orderStatus = ''
        $scope.base.approvalType = ''
        $scope.base.startTime = ''
        $scope.base.endTime = ''
    }


});