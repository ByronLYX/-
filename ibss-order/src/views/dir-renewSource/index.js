require('./index.less')
require('common/components/services/utils.js')
var viewTmpl = require('./view.tpl.html')

angular.module('ibss').directive('renewSource', function($rootScope, toaster, AMser, ibssUtils, $timeout, customDialog) {
    return {
        restrict: 'E',
        scope: {
            id: '=',
            ea: '=',
            startTime: '=',
            endTime: '=',
            accountType: '=',
            selected: '=',
            type: '='   // 1.编辑续费单 2.编辑续费源
        },
        template: viewTmpl,
        link: function($scope) {

            function handelEndTime(time) {
                if (!time) {
                    return time;
                }

                var date = new Date(time);

                date.setHours(23);
                date.setMinutes(59);
                date.setSeconds(59);

                return date.getTime();
            }

            $scope.initOrderData = function () {
                // debugger
                // 订单列表查询参数
                $scope.queryData = {
                    accountType: $scope.accountType.toString(),
                    startTimeBegin: '',
                    startTimeEnd: '',
                    endTimeBegin: '',
                    endTimeEnd: ''
                }
            }

            $scope.initData = function () {
                $scope.initOrderData();

                // 订单列表数据
                $scope.orderList = [];

                // 列表选中项
                $scope.selected = [];
            }

            $scope.query = function () {
                $scope.loading = true;

                var url = '';
                var endTimeMin = '';
                var endTimeMax = '';

                if ($scope.type === 1) {
                    url = _APIs.od_queryrenewlist + $scope.id;
                    endTimeMin = $scope.endTime;
                }
                else if ($scope.type === 2) {
                    url = _APIs.od_queryrenewsourcelist + $scope.id;
                    endTimeMax = $scope.endTime;
                }

                var data = {
                    accountType: $scope.queryData.accountType,
                    startTimeBegin: $scope.queryData.startTimeBegin,
                    startTimeEnd: handelEndTime($scope.queryData.startTimeEnd),
                    endTimeBegin: $scope.queryData.endTimeBegin,
                    endTimeEnd: handelEndTime($scope.queryData.endTimeEnd),
                    ea: $scope.ea,
                    endTimeMin: endTimeMin,
                    endTimeMax: endTimeMax
                };

                ibssUtils.api({
                    url: _APIs.od_querysubrenewlist,
                    method: 'POST',
                    data: data
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        // debugger
                        var orderList = res.data.model;

                        ibssUtils.api({
                            url: url,
                            method: 'POST',
                            data: {}
                        }).then(function(res) {
                            if (res.data && res.data.success) {
                                res.data.model.map(function (item, index) {
                                    orderList.map(function (value, key) {
                                        if (value.subOrderId === item) {
                                            value.selected = true;
                                            $scope.selected.push(value.subOrderId);
                                            var dataItem = orderList.splice(key, 1);
                                            orderList.unshift(dataItem[0]);
                                        }
                                    });
                                });

                                $scope.orderList = orderList;
                                $scope.loading = false;
                            }
                        })
                    }
                })
            }

            $scope.reset = function () {
                $scope.initOrderData();
                $scope.query();
            }

            $scope.selectItem = function (item) {
                item.selected = !item.selected;

                if (item.selected) {
                    $scope.selected.push(item.subOrderId);
                }
                else {
                    $scope.selected.map(function (value, key) {
                        if (value === item.subOrderId) {
                            $scope.selected.splice(key, 1);
                        }
                    });
                }
            }

            $scope.companyInfo = function (item) {
                customDialog.open({
                    title: '企业详情',
                    content: '<div><open-detail base-query="baseQuery" dialog-scope="dialogScope" ui="ui"></open-detail></div>',
                    noResize: true,
                    hideFooter: true,
                    size: 'dialogPosition',
                    okCallback: function(e, fn) {
                        
                    },
                    ctrl: function(dialogScope, $uibModalInstance) {
                        dialogScope.baseQuery = {
                            // _pid: parent.id,
                            _id: item.eaId,
                            _ea: item.ea,
                            _ei: item.ei,
                            enterpriseName: item.en,
                            content: 'content',
                            enterpriseType: item.eType,
                            url: '',
                            infoId: 'eaId',
                            date: 'date',
                            _fn: function() {},
                            navStatus: ['base', 'admin', 'contact', 'follow', 'usage', 'current', 'helper', 'activity', 'pau', 'operate', 'record', 'clue', 'active']
                        };
                        dialogScope.ui = {
                            off: dialogScope.off
                        }
                    }
                });
            }

            $scope.init = function () {
                $scope.initData();
                $scope.query();
            }

            $scope.init();
        }
    }
});