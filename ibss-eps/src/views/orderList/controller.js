require('common/components/services/utils.js')
require('./index.less')
require('../dir-orderView')
require('../dir-orderViewFree')
var contractTmpl = require('./contract.tpl.html')

angular.module('ibss')
    .controller('orderListController', function ($scope, customDialog, ibssUtils, $location, toaster, AMser) {
        $scope.tabStatus = 1
        $scope.freeType = 0
        var searchObj = $location.search()

        var paginationData = {
            totals: 0,
            currentPage: 1,
            maxSize: 10,
            itemsPerPage: 20
        }

        var handleBuyData = function (data) {
            data.map(function (item) {
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
                    item.orderStatusText = '待审核'
                } else if (item.orderStatus === 2) {
                    item.orderStatusText = '待补充合同'
                } else if (item.orderStatus === 3) {
                    item.orderStatusText = '已审核'
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

        var initBase = function () {
            $scope.base = {
                enterpriseName: '',
                enterpriseAccount: '',
                orderId: '',
                contractNo: '',
                payerName: '',
                upgradeType: '',
                orderStatus: '',
                approvalType: '',
                managerCode: '',
                managerCodeName: '',
                startTime: '',
                endTime: ''
            }
        }
        initBase()

        var queryBuyList = function (force) {
            $scope.paginationData = paginationData
            ibssUtils.api({
                url: _APIs.ca_order_querypage,
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
                    managerCode: $scope.base.managerCode,
                    startTime: $scope.base.startTime,
                    endTime: $scope.base.endTime,
                    pageIndex: force ? 1 : $scope.paginationData.currentPage,
                    pageSize: $scope.paginationData.itemsPerPage
                }
            }).then(function (res) {
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

        $scope.queryBuyOrder = function () {
            queryBuyList(true)
        }

        // 补充合同
        $scope.handleContract = function (id, type) {
            var images, cid
            var url = _APIs.ca_contract_updatesupplementarycontract;
            var contractUrl = _APIs.ca_contract_querycontract;

            if (type === 'free') {
                url = _APIs.od_update_freeordersupplementarycontract;
                contractUrl = _APIs.od_query_freeordercontract;
            }

            customDialog.open({
                title: '补充合同',
                content: contractTmpl,
                size: 'lg',
                enterText: '提交',
                okCallback: function (contractScope) {
                    // debugger

                    if (contractScope.uploadState.uploading) {
                        toaster.pop('error', '正在上传合同照片，请稍后重试');
                        return false;
                    }

                    var arr = []
                    images.map(function (item) {
                        item.src && arr.push(item.src);
                    })

                    if (arr.length <= 0 || !contractScope.sealName) {
                        toaster.pop('error', '合同照片和合同章名称不能为空')
                        return false
                    }

                    ibssUtils.api({
                        url: url,
                        method: 'POST',
                        data: {
                            contractPics: arr.toString(),
                            sealName: contractScope.sealName,
                            id: cid
                        }
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            type === 'free' ? queryFreeList(true) : queryBuyList(true);
                            toaster.pop('success', null, '提交成功!', 3000)
                        }
                    })
                },
                ctrl: function (contractScope) {
                    // debugger
                    contractScope.contractImage = [];
                    contractScope.uploadState = {uploading: false};
                    images = contractScope.file = contractScope.contractImage
                    ibssUtils.api({
                        url: contractUrl + id,
                        method: 'POST'
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            cid = res.data.model.id
                        }
                    })
                }
            })
        }

        $scope.handleBuyCheck = function (item) {
            customDialog.open({
                title: '查看',
                content: '<div><order-view detail="item" approve="approve" flag="flag" boole="boole"></order-view></div>',
                size: 'lg',
                hideFooter: true,
                ctrl: function (dialogScope) {
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

        $scope.handleBuyDelete = function (id) {
            if (confirm("确定要删除吗?")) {
                ibssUtils.api({
                    url: _APIs.ca_order_delete + id,
                    method: 'POST',
                }).then(function (res) {
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

        //免费订单列表
        var handleFreeData = function (data) {
            data.map(function (item) {
                if (item.orderStatus === 1) {
                    item.orderStatusText = '待审核'
                } else if (item.orderStatus === 2) {
                    item.orderStatusText = '待补充合同'
                } else if (item.orderStatus === 3) {
                    item.orderStatusText = '已审核'
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

        var queryFreeList = function (force) {
            $scope.paginationData = paginationData
            ibssUtils.api({
                url: _APIs.ca_freeorder_querypage,
                method: 'POST',
                data: {
                    enterpriseName: $scope.base.enterpriseName,
                    enterpriseAccount: $scope.base.enterpriseAccount,
                    id: $scope.base.orderId,
                    orderStatus: $scope.base.orderStatus,
                    startTime: $scope.base.startTime,
                    endTime: $scope.base.endTime,
                    type: $scope.freeType,
                    pageIndex: force ? 1 : $scope.paginationData.currentPage,
                    pageSize: $scope.paginationData.itemsPerPage
                }
            }).then(function (res) {
                if (res.data && res.data.success) {
                    var data = handleFreeData(res.data.model.content)
                    $scope.freeList = data
                    $scope.paginationData.totals = res.data.model.itemCount
                    $scope.paginationData.currentPage = res.data.model.pageIndex
                } else {
                    $scope.freeList = []
                    $scope.paginationData.totals = 0
                    $scope.paginationData.currentPage = 0
                }
            })
        }

        $scope.queryFreeOrder = function () {
            queryFreeList(true)
        }

        $scope.freeCheck = function (item) {
            item.orderType = $scope.tabStatus;
            customDialog.open({
                title: '查看',
                content: '<div><order-view-free detail="item" approve="approve" flag="flag" boole="boole"></order-view-free></div>',
                size: 'lg',
                hideFooter: true,
                ctrl: function (dialogScope) {
                    dialogScope.item = item
                    dialogScope.approve = {}
                    dialogScope.flag = true
                    dialogScope.boole = false
                }
            })
        }

        $scope.freeDelete = function (item) {
            if (confirm("确定要删除吗?")) {
                ibssUtils.api({
                    url: _APIs.ca_freeorder_delete + item.id,
                    method: 'POST'
                }).then(function (res) {
                    if (res.data && res.data.success) {
                        queryFreeList(true)
                        toaster.pop('success', null, '删除成功!', 3000)
                    }
                })
            }
        }

        // 选择公司代理商
        $scope.selectManager = function () {
            customDialog.open({
                title: '选择公司/代理商',
                content: require('../cashManage/select.tpl.html'),
                size: 'lg',
                hideFooter: true,
                // permission: 'RodrrpU',
                ctrl: function (selectScope, modalInstance) {
                    selectScope.treeConfig = {
                        multip: 2,
                        search: true,
                        btnEvent: 0,
                        readOnly: false
                    }

                    selectScope.selectCallBack = function (res) {
                        var select = res[0]
                        if (select.corpType === 1) {
                            $scope.base.managerCode = 'C_' + select.corpId
                        }
                        if (select.corpType === 2) {
                            $scope.base.managerCode = 'D_' + select.corpId
                        }
                        $scope.base.managerCodeName = select.corpName
                        modalInstance.close()
                    }

                    ibssUtils.api({
                        url: _APIs.ca_treeList,
                        method: 'POST'
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            selectScope.rangeAllTree = res.data.model
                            selectScope.rangeAllTree = AMser.treeData(selectScope.rangeAllTree, {
                                selectHide: 0
                            })
                        }
                    })

                }
            })


        }

        $scope.handleClick = function (n) {
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

        $scope.searchClick = function (n) {
            switch (n) {
                case 1:
                    $scope.tabStatus = 1
                    queryBuyList(true)
                    break
                case 2:
                    $scope.tabStatus = 2
                    $scope.freeType = 1
                    queryFreeList(true)
                    break
                case 3:
                    $scope.tabStatus = 3
                    $scope.freeType = 2
                    queryFreeList(true)
                    break
            }
        }

        $scope.pageChanged = function () {
            if ($scope.tabStatus === 1) {
                queryBuyList(false)
            } else {
                queryFreeList(false)
            }
        }

        $scope.changePageNum = function (n) {
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

        $scope.clearQuery = function () {
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
            $scope.base.managerCode = ''
            $scope.base.managerCodeName = ''
        }

        if (searchObj.orderId) {
            $scope.base.orderId = parseInt(searchObj.orderId)
            $scope.searchClick(parseInt(searchObj.tab))
        } else {
            queryBuyList(true)
        }

    })
