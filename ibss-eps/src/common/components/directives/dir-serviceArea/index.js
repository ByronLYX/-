require('./index.less');
var templateStr = require('./index.html');
angular.module('common.components')
    .directive('serviceArea', function(ibssUtils, customDialog, $timeout, toaster, AMser) {
        return {
            restrict: 'EA',
            template: templateStr,
            scope: {
                returnItem: '=',
                easyMode: '='
            },
            link: function($scope, elem) {
                $scope.init = function() {
                    $scope.selected = [];
                    $scope.showChildrenPlane = 0;
                    $scope.secondResult = [];
                    $scope.parentValue = '';
                    if (!window._localtionObj) {
                        AMser.getLocaltion(getDataCb);
                    } else {
                        getDataCb();
                    }

                    function getDataCb() {
                        $timeout(function() {
                            $scope.queryResult = window._localtionObj['0'];
                            $scope.queryResult.forEach(function(i) {
                                i.cur = 0;
                                i.child = [];
                            });
                        }, 10)
                    }
                };
                $scope.deleteSel = function(idx) {
                    var val = $scope.selected[idx].value;
                    $scope.selected[idx].child = [];
                    $scope.selected.splice(idx, 1);
                    $scope.queryResult.forEach(function(i) {
                        if (i.value == val) {
                            i.cur = 0;
                        }
                    });
                    $scope.secondResult.forEach(function(i) {
                        i.cur = 0;
                    });
                    $scope.showChildrenPlane = 0;
                };
                $scope.searchForDrag = function() {
                    elem.find('input').on('click', function() {
                        this.focus();
                    })
                };
                $scope.selectedItem = function(item) {
                    fn();
                    var i = 0,
                        d = $scope.selected,
                        len = d.length;
                    if (len == 0) {
                        item.cur = 1;
                        d.push(item);
                    } else {
                        for (i; i < len; i++) {
                            if (d[i].value == item.value) {
                                return;
                            }
                        }
                        item.cur = 1;
                        d.push(item);
                    }

                    function fn() {
                        $scope.showChildrenPlane = 1;
                        $scope.searchKey = null;
                        $scope.queryResult.forEach(function(i) {
                            i.query = 0;
                        });
                        $scope.parentValue = item.value;
                        $scope.secondResult = window._localtionObj[item.value];
                    }

                };
                $scope.okChildrenPlane = function() {
                    $scope.showChildrenPlane = 0;
                    $scope.secondResult = [];
                };
                $scope.closeChildrenPlane = function() {
                    $scope.showChildrenPlane = 0;
                    $scope.secondResult = [];
                };
                $scope.selectedSecond = function(item) {
                    console.log(item)
                    var i = 0,
                        d = $scope.selected,
                        child = [],
                        len = d.length;
                    for (; i < len; i++) {
                        if (d[i].value == $scope.parentValue) {
                            child = d[i].child;
                        }
                    };
                    var j = 0,
                        jen = child.length;
                    if (jen == 0) {
                        item.cur = 1;
                        child.push(item);
                        return;
                    }
                    for (; j < jen; j++) {
                        if (child[j].value == item.value) {
                            child.splice(j, 1);
                            item.cur = 0;
                            return
                        }
                    }
                    item.cur = 1;
                    child.push(item);
                };
                $scope.searchQueryResult = function() {
                    if (!$scope.queryResult) {
                        $scope.queryResult = window._localtionObj['0'];
                        return;
                    }
                    $scope.queryResult.forEach(function(i) {
                        if (i.name.indexOf($scope.searchKey) !== -1 && $scope.searchKey) {
                            i.query = 1;
                        }
                        if (!$scope.searchKey) {
                            i.query = 0;
                        }
                    });
                };
                $scope.submitSelected = function() {
                    var arr = [];
                    $scope.selected.forEach(function(i) {
                        arr.push(i)
                    })
                    $scope.closeChildrenPlane();
                    $scope.returnItem = arr;
                };
                $scope.closeSelectPane = function() {
                    $scope.returnItem = Math.random();
                };
                $scope.init();
            }
        };
    });