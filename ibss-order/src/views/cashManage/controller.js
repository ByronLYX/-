require('./index.less')
require('../dir-orderView')
require('common/components/services/utils.js')
var addCashTemp = require('./add.tpl.html')
var selectCompanyTemp = require('./select.tpl.html')
var splitTemp = require('./split.tpl.html')
var bindTemp = require('./bind.tpl.html')
var detailTemp = require('./detail.tpl.html')

angular.module('ibss')
    .controller('cashManageController', ($scope, customDialog, ibssUtils, AMser, toaster) => {
        var paginationList = {
            totals: 0,
            currentPage: 1,
            maxSize: 10,
            itemsPerPage: 20
        }

        //列表查询
        var queryList = function (force) {
            $scope.paginationData = paginationList
            $scope.params = {
                receivedPayNo: $scope.receivedPayNo,
                payerName: $scope.payerName,
                bankName: $scope.bankName,
                deptCompanyName: $scope.deptCompanyName,
                claimed: (function () {
                    if ($scope.claimed == 1) {
                        return true
                    } else if ($scope.claimed == 2) {
                        return false
                    } else {
                        return
                    }
                })(),
                startTime: $scope.startTime,
                endTime: $scope.endTime,
                pageIndex: force ? 1 : $scope.paginationData.currentPage,
                pageSize: $scope.paginationData.itemsPerPage
            }
            ibssUtils.api({
                url: _APIs.ca_receivedpay_querypage,
                method: 'POST',
                data: $scope.params
            }).then(function (res) {
                if (res.data && res.data.success) {
                    $scope.cashList = res.data.model.content
                    $scope.paginationData.totals = res.data.model.itemCount
                    $scope.paginationData.currentPage = res.data.model.pageIndex
                } else {
                    $scope.cashList = []
                    $scope.paginationData.totals = 0
                    $scope.paginationData.currentPage = 0
                }
            })
        }

        //查看详情
        var detailCash = function (item) {
            customDialog.open({
                title: '详情',
                content: detailTemp,
                size: 'lg',
                noResize: true,
                hideFooter: true,
                ctrl: function (detailScope, modalInstance) {
                    item.receivedPayTimeText = AMser.getHumDate(item.receivedPayTime, 'S')
                    detailScope.detail = item
                    ibssUtils.api({
                        url: _APIs.ca_receivedpay_querybingdingorder + item.id,
                        method: 'POST'
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            detailScope.bindOrder = res.data.model
                        }
                    })

                    //订单详情
                    detailScope.bindCheckDetail = function (item) {
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
                    }

                    detailScope.unBindOrder = function () {
                        if (confirm("确定要解绑吗?")) {
                            ibssUtils.api({
                                url: _APIs.ca_receivedpay_updateorderid,
                                method: 'POST',
                                data: {
                                    ids: item.id + '',
                                    orderId: null
                                }
                            }).then(function (res) {
                                if (res.data && res.data.success) {
                                    toaster.pop('success', null, '解绑成功!', 3000);
                                    $scope.receivedQuery()
                                    modalInstance.close()
                                }
                            })
                        }

                    }
                }

            })
        }

        queryList(true)

        $scope.receivedQuery = function () {
            queryList(true)
        }

        $scope.pageChanged = function () {
            queryList(false)
        }

        $scope.changePageNum = function (n) {
            if (n) {
                paginationList.itemsPerPage = n
            } else {
                paginationList.itemsPerPage = 20
            }
            queryList(true)
        }

        //查看
        $scope.handleCheck = function (item) {
            if (item.orderId) {
                detailCash(item)
            } else {
                $scope.addCash(item)
            }
        }

        //删除
        $scope.handleDelete = function (item) {
            if (confirm("确定要删除吗?")) {
                ibssUtils.api({
                    url: _APIs.ca_receivedpay_delete + item.id,
                    method: 'POST',
                }).then(function (res) {
                    if (res.data && res.data.success) {
                        $scope.cashList.splice($scope.cashList.indexOf(item), 1)
                        toaster.pop('success', null, '删除成功!', 3000);
                    }
                })
            }
        }

        //绑定
        $scope.handleBind = function (its) {
            var radId
            customDialog.open({
                title: '选择订单',
                content: bindTemp,
                size: 'lg',
                noResize: true,
                enterText: '提交',
                okCallback: function () {
                    if (radId && its.id) {
                        ibssUtils.api({
                            url: _APIs.ca_receivedpay_updateorderid,
                            method: 'POST',
                            data: {
                                ids: its.id + '',
                                orderId: radId
                            }
                        }).then(function (res) {
                            if (res.data && res.data.success) {
                                $scope.receivedQuery()
                                toaster.pop('success', null, '绑定成功!', 3000);
                            }
                        })
                    }
                },
                ctrl: function (bindScope) {
                    var paginationBind = {
                        totals: 0,
                        currentPage: 1,
                        maxSize: 10,
                        itemsPerPage: 10
                    }
                    bindScope.paginationData = paginationBind
                    var query = function (force) {
                        bindScope.bind = {
                            orderId: bindScope.orderId,
                            contractNo: bindScope.contractNo,
                            enterpriseName: bindScope.enterpriseName,
                            enterpriseAccount: bindScope.enterpriseAccount,
                            payerName: bindScope.payerName,
                            pageIndex: force ? 1 : bindScope.paginationData.currentPage,
                            pageSize: bindScope.paginationData.itemsPerPage
                        }

                        ibssUtils.api({
                            url: _APIs.ca_order_querypage,
                            method: 'POST',
                            data: bindScope.bind
                        }).then(function (res) {
                            if (res.data && res.data.success) {
                                bindScope.bindList = res.data.model.content
                                bindScope.paginationData.totals = res.data.model.itemCount;
                                bindScope.paginationData.currentPage = res.data.model.pageIndex;
                            }
                        })
                    }

                    bindScope.bindQuery = function () {
                        if (bindScope.orderId || bindScope.contractNo || bindScope.enterpriseName ||
                            bindScope.enterpriseAccount || bindScope.payerName) {
                            query(true)
                        } else {
                            toaster.pop('error', null, '查询条件不能为空!', 3000)
                        }

                    }

                    bindScope.pageChanged = function () {
                        query(false)
                    }

                    bindScope.radioChange = function (id) {
                        radId = id
                    }

                    //订单详情
                    bindScope.handleDetail = function (item) {
                        ibssUtils.api({
                            url: _APIs.ck_getCompany + item.id
                        }).then(function (res) {
                            if (res.data && res.data.success) {
                                res.data.model.companyScale = '' + res.data.model.companyScale;
                                res.data.model.groupType = '' + res.data.model.groupType;
                                res.data.model.isSaleTeam = '' + res.data.model.isSaleTeam;
                                res.data.model.saleTeamScale = '' + res.data.model.saleTeamScale;
                                res.data.model.isReferral = '' + res.data.model.isReferral;
                                res.data.model.isSaleTeam = '' + res.data.model.isSaleTeam;
                                res.data.model.isMarking = '' + res.data.model.isMarking;
                                res.data.model.source = '' + res.data.model.source;
                            }
                        });
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
                    }

                    bindScope.clearQuery = function () {
                        bindScope.orderId = '';
                        bindScope.contractNo = '';
                        bindScope.enterpriseName = '';
                        bindScope.enterpriseAccount = '';
                        bindScope.payerName = '';
                    }


                }
            })

        }

        //拆分
        $scope.handleSplit = function (item) {
            var splitData
            customDialog.open({
                title: '拆分数据',
                content: splitTemp,
                size: 'lg',
                noResize: true,
                enterText: '提交',
                okCallback: function () {
                    var sum = 0
                    for (let i in splitData) {
                        if (splitData[i].receivedPayAmount) {
                            sum += splitData[i].receivedPayAmount
                            continue
                        } else {
                            toaster.pop('error', null, '拆分后的金额不等于原金额!', 3000)
                            return false
                        }
                    }

                    if (sum !== item.receivedPayAmount) {
                        toaster.pop('error', null, '拆分后的金额不等于原金额!', 3000)
                        return false

                    }

                    ibssUtils.api({
                        url: _APIs.ca_receivedpay_updatetomultiple,
                        method: 'POST',
                        data: {
                            details: splitData,
                            id: item.id
                        }
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            $scope.receivedQuery()
                            toaster.pop('success', null, '拆分成功!', 3000);
                        }
                    })

                },
                ctrl: function (splitScope) {
                    var n = 2
                    splitScope.split = item
                    splitScope.splitList = [
                        {id: 1, receivedPayAmount: '', handlingCharge: ''},
                        {id: 2, receivedPayAmount: '', handlingCharge: ''}
                    ]
                    splitScope.addSplit = function () {
                        var obj = {
                            id: ++n,
                            receivedPayAmount: '',
                            handlingCharge: ''
                        }
                        splitScope.splitList.push(obj)
                    }

                    splitScope.delSplit = function (item) {
                        --n
                        splitScope.splitList.splice(splitScope.splitList.indexOf(item), 1)
                    }
                    splitData = splitScope.splitList
                }
            })
        }

        //新建/编辑
        $scope.addCash = function (item) {
            var data
            if (item) {
                data = {
                    receivedPayNo: item.receivedPayNo,
                    receivedPayTime: item.receivedPayTime,
                    payerName: item.payerName,
                    receivedPayAmount: item.receivedPayAmount,
                    handlingCharge: item.handlingCharge,
                    bankName: item.bankName,
                    deptCompanyName: item.deptCompanyName,
                    companyId: item.companyId || '',
                    deptId: item.deptId || '',
                    id: item.id
                }
            } else {
                data = {
                    receivedPayNo: '',
                    receivedPayTime: '',
                    payerName: '',
                    receivedPayAmount: '',
                    handlingCharge: '',
                    bankName: '',
                    deptCompanyName: ''
                }
            }

            $scope.add = data
            customDialog.open({
                title: item ? '编辑数据' : '创建数据',
                content: addCashTemp,
                size: 'lg',
                noResize: true,
                enterText: '提交',
                permission: 'RodrrpU',
                okCallback: function (e, fn) {
                    var dic = {
                        receivedPayNo: '到款编号',
                        receivedPayTime: '到款日期',
                        payerName: '打款名称',
                        bankName: '收款银行名称',
                    }

                    if (!AMser.checkData($scope.add, dic)) {
                        return false;
                    }

                    if($scope.add.receivedPayAmount === ''){
                        toaster.pop('error', null, '金额不能为空!', 3000);
                        return false;
                    }

                    if($scope.add.handlingCharge === ''){
                        toaster.pop('error', null, '手续费不能为空!', 3000);
                        return false;
                    }

                    ibssUtils.api({
                        url: item ? _APIs.ca_receivedpay_update : _APIs.ca_receivedpay_create,
                        method: 'POST',
                        data: $scope.add
                    }).then(function (res) {
                        if (res.data && res.data.success) {
                            $scope.receivedQuery();
                            toaster.pop('success', null, '创建成功!', 3000);
                            fn();
                        }
                    })
                    return false;
                },
                ctrl: function (addScope) {
                    addScope.add = $scope.add
                    addScope.select = function () {
                        customDialog.open({
                            title: '选择公司/代理商',
                            content: selectCompanyTemp,
                            size: 'lg',
                            hideFooter: true,
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
                                        addScope.add.companyId = select.corpId
                                    }
                                    if (select.corpType === 2) {
                                        addScope.add.deptId = select.corpId
                                    }
                                    addScope.add.deptCompanyName = select.corpName
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
                }
            })
        }

        //导入
        $scope.importExcel = function () {
            customDialog.open({
                title: '批量导入',
                content: '<div><import import-config="upload"></import></div>',
                noResize: true,
                hideFooter: true,
                okCallback: function (e, fn) {
                },
                ctrl: function (dialogScope) {
                    dialogScope.upload = {};
                }
            })
        }

        //导出
        $scope.export = function () {
            let url = `${location.origin}${_APIs.ca_receivedpay_export}?${$.param($scope.params)}`
            window.open(url)
        }

        $scope.clearQuery = function () {
            $scope.receivedPayNo = '';
            $scope.payerName = '';
            $scope.bankName = '';
            $scope.deptCompanyName = '';
            $scope.claimed = '';
            $scope.startTime = '';
            $scope.endTime = '';
        }


    })