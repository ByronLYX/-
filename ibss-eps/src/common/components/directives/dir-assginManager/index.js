require('./index.less');
var templateStr = require('./index.html');
angular.module('common.components').directive('assginManager', function(ibssUtils, customDialog, $timeout, toaster, AMser) {
    return {
        restrict: 'EA',
        template: templateStr,
        scope: {
            data: '='
        },
        link: function($scope, elem) {
            $scope.assginObj = {};
            $scope.code = [];
            var _AREA;

            $scope.init = function() {
                ibssUtils.api({
                    url: _APIs.am_queryDis + '/' + $scope.data._id,
                }).then(function suc(res) {
                    if (res.data && res.data.success) {
                        res.data.model.forEach(function(i) {
                            $scope.code.push(i.areaCode);
                            i.accountInfos = i.accountInfos || [];
                        });
                        _AREA = getData($scope.code, $scope.assginObj, res.data.model);
                        $scope.assginObj = _AREA.obj;
                        console.log($scope.assginObj)
                        $scope.data.submitData = res.data.model;
                    }
                });
            };

            function deepCopy(obj) {
                if (typeof(obj) !== 'object' || obj === null || obj === undefined) return obj;
                var reObj = new obj.constructor();
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        reObj[key] = deepCopy(obj[key]);
                    }
                }
                return reObj;
            }

            function getData(code, obj, managers) {
                var _temp = {};
                var _l = deepCopy(window._localtionObj);
                var _lo = _l['0'];
                var i, provs = [],
                    obj = {},
                    len = _lo.length;
                _l[0].forEach(function(l) {
                    code.forEach(function(item) {
                        if (item == l.value) {
                            return;
                        }
                        var obj = _l[l.value];
                        for (var i = 0, len = obj.length; i < len; i++) {
                            if (obj[i].value == item && !_temp[obj[i].parentValue]) {
                                _temp[obj[i].parentValue] = true;
                                break;
                            }
                        }
                    });
                })
                for (var key in _temp) {
                    if (code.indexOf(key) == -1) {
                        code.push(key)
                    }
                }
                code.forEach(function(code) {
                    for (i = 0; i < len; i++) {
                        if (~~_lo[i].value == ~~code) {
                            _lo[i].child = _l[_lo[i].value];
                            obj[_lo[i].value] = _lo[i];
                            obj[_lo[i].value].str = [];
                            break;
                        }
                    };
                });
                code.forEach(function(code) {
                    for (var j in obj) {
                        obj[j].child.forEach(function(i) {
                            if (~~i.value == ~~code) {
                                managers.forEach(function(g) {
                                    if (~~i.value == ~~g.areaCode) {
                                        i.manager = g.accountInfos || [];
                                        obj[j].str.push(i);
                                    }
                                });
                            }
                        });
                    }
                });
                console.log(obj)
                for (var i in obj) {
                    if (obj[i].str.length == 0) {
                        managers.forEach(function(g) {
                            if (~~obj[i].value == ~~g.areaCode) {
                                obj[i].str.push({
                                    name: '全省、直辖市',
                                    manager: g.accountInfos || []
                                });
                            }
                        });
                    }
                    provs.push(obj[i].name);
                }

                var servicesArea = {
                    obj: obj,
                    provs: provs
                }
                return servicesArea;
            };

            $scope.showQuery = 0;
            $scope.assgin = {};
            $scope.nowCity = null;
            $scope.queryManager = function(prov, city) {
                $scope.assgin.prov = prov.name;
                $scope.assgin.city = city.name;
                $scope.showQuery = 1;
                $scope.nowCity = city;
                city.manager.forEach(function(i) {
                    i.select = 1;
                    $scope.cache.push(i.accountId)
                });
                $scope.selected = city.manager;
            }

            $scope.queryItem = function() {
                if (!$scope.queryKey) {
                    $scope.result = [];
                    return;
                }
                ibssUtils.api({
                    url: _APIs.manager + '/' + $scope.queryKey,
                    method: 'POST'
                }).then(function successCallback(res) {
                    if (res.data && res.data.success) {
                        $scope.result = [];
                        var data = res.data.model,
                            len = data.length;
                        if (len == 0) {
                            return;
                        }
                        data.forEach(function(i) {
                            i['select'] = 0;
                            $scope.cache.forEach(function(j) {
                                if (i.id == j) {
                                    i['select'] = 1;
                                }
                            });
                            if ($scope.result.length < 18) {
                                $scope.result.push(i);
                            }
                        });
                    }
                });
            };
            $scope.selectItem = function(item) {
                var idx = $scope.cache.indexOf(item.accountId);
                item.select = !item.select;
                if (idx >= 0) {
                    $scope.selected.splice(idx, 1);
                    $scope.cache.splice(idx, 1);
                } else {
                    $scope.cache.push(item.id);
                    $scope.selected.push(item);
                }
            };
            $scope.targetSelect = function(item) {
                var odx = $scope.ids.indexOf(item.id);
                var edx = $scope.ids.indexOf(item.enterpriseAccountId);
                var idx = odx > -1 ? odx : edx;
                if ($scope.ids.length >= 2) {
                    $scope.items.splice(idx, 1);
                    $scope.ids.splice(idx, 1);
                } else {
                    toaster.pop('info', '至少保留一个分配目标')
                    return;
                }
                item.select = !item.select;
            }
            $scope.initQuery = function() {
                $scope.selected = [];
                $scope.result = [];
                $scope.cache = [];
                $scope.queryKey = '';
            };
            $scope.submitSelected = function() {
                $scope.showQuery = !$scope.showQuery;
                $scope.initQuery();
            };
            $scope.closeSelectPane = function() {
                $scope.showQuery = !$scope.showQuery;
                $scope.initQuery();
            };
            $scope.init();
            $scope.initQuery();
        }
    };
});