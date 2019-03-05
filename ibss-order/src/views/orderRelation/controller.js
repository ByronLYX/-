require('./index.less')
require('../dir-renewSource')
require('../dir-notRenew')

angular.module('ibss').controller('orderRelationController', function($scope, customDialog, ibssUtils, toaster) {

	// $scope.tabClick = function (index) {
	// 	$scope.tabStatus = index;
	// }

    var INFO = {
        RENEW_SUCCESS: '编辑续费单成功',
        SOURCE_SUCCESS: '编辑续费源单成功',
        ACTIVE_MONTH: '请选择活跃月份'
    }

    function getEndTimeBegin() {
        var date = new Date();

        date.setDate(1);

        return new Date(date).getTime();
    }

    function getEndTimeEnd() {
        var date = new Date();
        var month = date.getMonth();

        month = month + 4;
        date.setMonth(month);
        date.setDate(1);
        date.setDate(date.getDate() - 1);

        return new Date(date).getTime();
    }

	$scope.initStateData = function () {
		// 状态列表查询参数
    	$scope.queryState = {
    		accountType: '',
    		startTimeBegin: '',
            startTimeEnd: '',
    		endTimeBegin: getEndTimeBegin(),
            endTimeEnd: getEndTimeEnd(),
    		orderType: '',
    		orderId: '',
    		createTimeBegin: '',
            createTimeEnd: '',
    		renewType: '1',
    		enterpriseName: '',
    		enterpriseAccount: '',
    		// activeMonth: String(new Date().getMonth() + 1),
            activeMonth: new Date().getTime(), 
            activeDaysMin: '',
            activeDaysMax: '',
            csmPerson: '',
            csmPersonStr: '',
            csmDep: '',
            csmDepStr: '',
            manager: '',
            managerStr: '',
            company: '',
            companyStr: '',
            hasManager: '',
            hasCsm: ''
    	}

        // 状态列表分页
        $scope.paginationData = {
            totals: 0,
            currentPage: 1,
            maxSize: 10,
            itemsPerPage: 20
        };

        $scope.paging = '20';
	}

    $scope.initData = function () {
    	$scope.initStateData();

    	// 状态列表数据
    	$scope.stateList = [];
    	
    	// tab状态
    	// $scope.tabStatus = 1;
    }

    $scope.changePageNum = function () {
    	$scope.paginationData.itemsPerPage = +$scope.paging;
        $scope.paginationData.currentPage = 1;
        $scope.query();
    }

    $scope.activeDaysHandel = function (type) {
        if (type === 'min') {
            var value = parseInt($scope.queryState.activeDaysMin, 10);

            if (value <= 0 || isNaN(value)) {
                $scope.queryState.activeDaysMin = '';
            }
            else {
                $scope.queryState.activeDaysMin = value;
            }
        }
        else if (type === 'max') {
            var value = parseInt($scope.queryState.activeDaysMax, 10);

            if (value <= 0 || isNaN(value)) {
                $scope.queryState.activeDaysMax = '';
            }
            else {
                $scope.queryState.activeDaysMax = value;
            }
        }
    }

    function handelBeginTime(time) {
        if (!time) {
            return time;
        }

        var date = new Date(time);

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);

        return date.getTime();
    }

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

    function getActiveMonth(time) {
        var date = new Date(time);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;

        if (month < 10) {
            month = '0' + month;
        }

        return [year, month].join('');
    }

    $scope.check = function () {
        if (!$scope.queryState.activeMonth) {
            toaster.pop('error', INFO.ACTIVE_MONTH);
            return true;
        }
    }

    $scope.query = function () {
        $scope.loading = true;

        if ($scope.check()) {
            return;
        }

        var data = {
            accountType: $scope.queryState.accountType,
            startTimeBegin: handelBeginTime($scope.queryState.startTimeBegin),
            startTimeEnd: handelEndTime($scope.queryState.startTimeEnd),
            endTimeBegin: handelBeginTime($scope.queryState.endTimeBegin),
            endTimeEnd: handelEndTime($scope.queryState.endTimeEnd),
            renewType: $scope.queryState.renewType,
            createTimeBegin: handelBeginTime($scope.queryState.createTimeBegin),
            createTimeEnd: handelEndTime($scope.queryState.createTimeEnd),
            orderId: $scope.queryState.orderId,
            en: $scope.queryState.enterpriseName,
            ea: $scope.queryState.enterpriseAccount,
            month: getActiveMonth($scope.queryState.activeMonth),
            activeDaysMin: $scope.queryState.activeDaysMin,
            activeDaysMax: $scope.queryState.activeDaysMax,
            csmDeptId: $scope.queryState.csmDep,
            csmId: $scope.queryState.csmPerson,
            pageIndex: $scope.paginationData.currentPage,
            pageSize: $scope.paginationData.itemsPerPage,
            agentName: $scope.queryState.companyStr,
            managerId: $scope.queryState.manager,
            hasManager: ($scope.queryState.hasManager
                            ? $scope.queryState.hasManager === '1' ? true : false
                            : ''
                        ),
            hasCsm: ($scope.queryState.hasCsm
                        ? $scope.queryState.hasCsm === '1' ? true : false
                        : ''
                    )
        };

    	ibssUtils.api({
            url: _APIs.od_querysubrenewpage,
            method: 'POST',
            data: data
        }).then(function(res) {
            // debugger
            if (res.data && res.data.success) {
                var model = res.data.model;
                $scope.stateList = model.content;
                $scope.paginationData.totals = model.itemCount;
                $scope.paginationData.currentPage = model.pageIndex === 0 ? 1 : model.pageIndex;
                $scope.loading = false;
            }
        })
    }

    $scope.reset = function () {
    	$scope.initStateData();
    	$scope.query();
    }

    $scope.editOrderRelation = function (type, data) {

        var title = '';

        if (type === 1) {
            title = '请编辑续费单';
        }
        else if (type === 2) {
            title = '请编辑续费源';
        }

        customDialog.open({
            title: title,
            content: '<renew-source selected="selected" ea="ea" id="id" start-time="startTime" end-time="endTime" account-type="accountType" type="type"></renew-source>',
            size: 'relation',
            okCallback: function(e, fn) {

                var url = '';
                var saveData = {};
                var info = '';

                if (type === 1) {
                    url = _APIs.od_updatesourceandrenewrel;
                    saveData = {
                        sourceId: data.subOrderId,
                        renewIdList: e.selected
                    };
                    info = INFO.RENEW_SUCCESS;
                }
                else if (type === 2) {
                    url = _APIs.od_updaterenewandsourcerel;
                    saveData = {
                        renewId: data.subOrderId,
                        sourceIdList: e.selected
                    };
                    info = INFO.SOURCE_SUCCESS;
                }

                ibssUtils.api({
                    url: url,
                    method: 'POST',
                    data: saveData
                }).then(function(res) {
                    if (res.data && res.data.success) {
                        toaster.pop('success', info);
                        $scope.query();
                    }
                })
            },
            cancelCallback: function() {

            },
            ctrl: function(dialogScope) {
                dialogScope.ea = data.ea;
                dialogScope.id = data.subOrderId;
                dialogScope.startTime = data.startTime;
                dialogScope.endTime = data.endTime;
                dialogScope.accountType = data.accountType;
                dialogScope.type = type;
                dialogScope.selected = [];
            }
        })
    }

    $scope.getMonth = function () {
        var month = [];

        for (var i = 1, l = 12; i <= l; i++) {
            month.push(i);
        }

        $scope.month = month;
    }

    $scope.assignHandel = function (type, tabType) {
        var title = '';
        var tabHide = '';

        switch(type) {
            case 1:
                title = 'CSM负责人';
                tabHide = 2;
                break;
            case 2:
                title = 'CSM所在部门';
                tabHide = 1;
                break;
            case 3:
                title = '客户经理';
                tabHide = 2;
                break;
            case 4:
                title = '公司/代理商';
                tabHide = 1;
                break;
        }

        customDialog.open({
            title: title,
            content: '<assignment hide-title="hideTitle" label-name="labelName" post-name="postName" link="link" selected="selected" type="type" items="items" ids="ids" strict-mode="strictMode" tab-type="tabType" code="code" tab-hide="tabHide"></assignment>',
            noResize: true,
            okCallback: function(e, fn) {

                var data = e.selected[0];

                switch(type) {
                    case 1:
                        $scope.queryState.csmPerson = data.id;
                        $scope.queryState.csmPersonStr = data.name;
                        break;
                    case 2:
                        $scope.queryState.csmDep = data.id;
                        $scope.queryState.csmDepStr = data.name;
                        break;
                    case 3:
                        $scope.queryState.manager = data.id;
                        $scope.queryState.managerStr = data.name;
                        break;
                    case 4:
                        $scope.queryState.company = data.id;
                        $scope.queryState.companyStr = data.name;
                        break;
                }
            },
            cancelCallback: function() {

            },
            ctrl: function(dialogScope, $uibModalInstance) {
                dialogScope.hideTitle = true;
                dialogScope.labelName = '';
                dialogScope.link = _APIs.follow;
                dialogScope.postName = 'accountname';
                dialogScope.selected = [];
                dialogScope.type = '';
                dialogScope.items = [];
                dialogScope.ids = [];
                dialogScope.strictMode = true;
                dialogScope.code = '';
                dialogScope.tabType = tabType;
                dialogScope.tabHide = tabHide;
            }
        });
    }

    $scope.notRenew = function (data) {
        customDialog.open({
            title: '请输入不续费原因',
            content: '<not-renew id="id" reason="reason" ui="ui" tag="tag"></not-renew>',
            noResize: true,
            hideFooter: true,
            size: 'notrenew',
            okCallback: function(e, fn) {
                $scope.query();
            },
            cancelCallback: function() {

            },
            ctrl: function(dialogScope, $uibModalInstance) {
                dialogScope.id = data.subOrderId;
                dialogScope.reason = data.reason;
                dialogScope.ui = {
                    ok: dialogScope.ok,
                    off: dialogScope.off
                }
                dialogScope.tag = data.tags || '';
            }
        });
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

    $scope.initActiveMonth = function () {
        $scope.dateOptions = {
            datepickerMode: 'month',
            minMode: 'month'
        };

        $scope.attrOptions = {
            uibDatepickerPopup:'yyyy/MM',
            required: true
        };
    }

    $scope.init = function () {
    	$scope.initData();
        // $scope.getMonth();
        $scope.initActiveMonth();
        $scope.query();
    }

    $scope.init();
});