require('./index.less');
var templateStr = require('./index.html');
angular.module('common.components').directive('agentForm', function($rootScope, ibssUtils, customDialog, $timeout, toaster, AMser) {
    return {
        restrict: 'EA',
        template: templateStr,
        scope: {
            agent: "="
        },
        link: function($scope, elem) {
            $scope.isOptAuthor = AMser.author($rootScope, 'amOL')
            $scope.agent._humDate = AMser.getHumDate($scope.agent.cooperateDate, '');
						$scope.haha = function(aaa){
							console.log(aaa)
						};
            $scope.exName = $scope.agent.name;
            $scope.hasParent = function(status) {
                $scope.agent.hasParentNameStatus = status;
                if ($scope.agent.hasParentNameStatus) {
                    $scope.agent.hasParentName = '';
                    $scope.agent.hasParentId = '';
                }
            };
            $scope.opt = {
                queryDataResult: [],
                paginationData: {
                    totals: 0,
                    currentPage: 1,
                    maxSize: 10,
                    itemsPerPage: 10
                }
            };
            $scope.operateInit = function() {
                if ($scope.agent._type !== 'check') {
                    return;
                }
                if (!$scope.isOptAuthor) {
                    return;
                }
                var data = {
                    accountName: $scope.agent.optAccountName,
                    bizId: $scope.agent._id,
                    endTime: $scope.agent.optEndTime,
                    operateType: $scope.agent.operateType,
                    startTime: $scope.agent.optStartTime,
                    pageIndex: $scope.opt.paginationData.currentPage,
                    pageSize: $scope.opt.paginationData.itemsPerPage,
                }
                ibssUtils.api({
                    url: _APIs.am_log,
                    data: data
                }).then(function suc(res) {
                    if (res.data && res.data.success) {
                        res.data.model.content.forEach(function(item) {
                            item.operateDate = AMser.getHumDate(item.operateDate, 'M');
                            item.operateContents = item.operateContents ? item.operateContents : [];
                            if (item.operateContents.length >= 1) {
                                item.operateContents.forEach(function(i) {
                                    i.oldVal = i.oldVal ? i.oldVal : '';
                                    i.newVal = i.newVal ? i.newVal : '';
                                    i._key = i.field;
                                    if (i.oldVal.indexOf('[') !== -1 || i.newVal.indexOf('[') !== -1) {
                                        i._content = '【' + i._key + '】变更'
                                    } else {
                                        i._content = '【' + i._key + '】，' + '【' + i.oldVal + '】修改为【' + i.newVal + '】';
                                    }
                                });
                            }
                            item.accountName = item.accountName ? item.accountName : '-';
                            switch (item.operateType) {
                                case 1:
                                    item.operateType = '新建';
                                    break;
                                case 2:
                                    item.operateType = '修改';
                                    break;
                                case 3:
                                    item.operateType = '删除';
                                    break;
                                case 4:
                                    item.operateType = '启用';
                                    break;
                                case 5:
                                    item.operateType = '停用';
                                    break;
                                case 6:
                                    item.operateType = '分配渠道经理';
                                    break;
                                default:
                                    break;
                            };
                        });
                        $scope.opt.paginationData.totals = res.data.model.itemCount;
                        $scope.opt.paginationData.currentPage = res.data.model.pageIndex;
                        $scope.opt.queryDataResult = res.data.model.content;
                    }
                });
            }
            $scope.operateInit();
            $scope.pageChanged = function() {
                $scope.operateInit();
            };
            $scope.addLocaltion = [];
            $scope.serLocaltion = [];
            $scope.agentParent = [];
            $scope.show = {
                localtion: 0,
                serviceLocaltion: 0,
                agentParent: 0
            };
            var aOff = $scope.$watch('addLocaltion', function() {
                $scope.show.localtion = 0;
                var arr = [];
                if ($scope.addLocaltion.length) {
                    $scope.addLocaltion.forEach(function(item) {
                        arr.push(item.name);
                    });
                    $scope.agent.localtionID = $scope.addLocaltion[$scope.addLocaltion.length - 1].value;
                    $scope.agent.localtion = arr.join('-');
                }
            });
            var bOff = $scope.$watch('serLocaltion', function(o, n) {
                if (!window._localtionObj) {
                    return;
                }
                var arr = [];
                var code = [];
                if ($scope.serLocaltion.length) {
                    $scope.serLocaltion.forEach(function(item) {
                        arr.push(item.name);
                        if (item.parentValue == '0' && item.child.length) {
                            item.child.forEach(function(i) {
                                code.push(i.value);
                            });
                        } else {
                            code.push(item.value);
                        }
                    });
                    $scope.agent.serviceLocaltionID = code;
                    $scope.agent.serviceLocaltion = arr.join('-');
                    if (typeof o == 'number') {
                        $scope.agent._type = 'check';
                    } else if (o.length) {
                        $scope.agent._type = 'create';
                    }
                }
                $timeout(function() {
                    $scope.show.serviceLocaltion = 0;
                }, 320);
            });
            var cOff = $scope.$watch('agentParent', function() {
                $scope.show.agentParent = 0;
                var arr = [];
                if ($scope.agentParent.length) {
                    $scope.agentParent.forEach(function(item) {
                        arr.push(item.name);
                    });
                    $scope.agent.hasParentId = $scope.agentParent[$scope.agentParent.length - 1].id;
                    $scope.agent.hasParentName = arr.join('-');
                }
            });

            $scope.getAgentParent = function() {
                $scope.show.agentParent = !$scope.show.agentParent;
            }
            $scope.getLocaltion = function() {
                $scope.show.localtion = !$scope.show.localtion;
            };
            $scope.getServiceLocaltion = function() {
                $scope.show.serviceLocaltion = !$scope.show.serviceLocaltion;
            };
            $scope.editServiceLocaltion = function() {
                $scope.agent._type = 'create';
                $scope.getServiceLocaltion();
            };
        }
    };
});