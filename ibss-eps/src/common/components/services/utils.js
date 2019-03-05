angular.module('ibss').factory('AMser', function($timeout, $rootScope, toaster, ibssUtils) {
    function reGroup(data) {
        var obj = {};
        data.forEach(function(item) {
            if (!obj[item.parentValue]) {
                obj[item.parentValue] = [];
                obj[item.parentValue].push(item);
            } else {
                obj[item.parentValue].push(item);
            }
        });
        return obj;
    }

    function getLocaltion(fn) {
        ibssUtils.api({
            url: _APIs.localtion,
            method: 'POST'
        }).then(function successCallback(res) {
            if (res.data && res.data.success) {
                window._localtion = res.data.model;
                window._localtionObj = reGroup(res.data.model);
                fn && fn();
            }
        });
    }

    function getIndustry(fn) {
        ibssUtils.api({
            url: _APIs.industry,
            method: 'POST',
            data: angular.toJson({ name: 'INDUSTRY_NEW' })
        }).then(function successCallback(res) {
            if (res.data && res.data.success) {
                window._industry = res.data.model;
                window._industryObj = reGroup(res.data.model);
                fn && fn();
            }
        });
    }

    return {
        author: function(root, code) {
            if (root.modules.length == 0) {
                return;
            }
            return root.modules.indexOf(code) === -1 ? false : true;
        },
        getIndustry: function(fn) {
            if (!window._industry) {
                getIndustry(fn);
            } else {
                fn();
            }
        },
        getLocaltion: function(fn) {
            if (!window._localtion) {
                getLocaltion(fn);
            } else {
                fn();
            }
        },
        randomStr: function(l, t) {
            l = l || 16;
            var s = Math.random().toString(16).substr(4, l)
            s = t ? s.toLocaleUpperCase() : s.toLocaleLowerCase();
            return s;
        },
        codeToStr: function(code, type) {
            if (!code || !window['_' + type]) {
                return '-';
            }
            var code = code;
            var arr = [];
            switch (type) {
                case 'industry':
                    return returnIndustry();
                case 'localtion':
                    return returnLocaltion();
                default:
                    break;
            }

            function returnIndustry() {
                return callback();

                function callback(item) {
                    code = item ? item : code;
                    window._industry.forEach(function(i) {
                        if (i.value == code) {
                            if (i.parentValue !== 0) {
                                callback(i.parentValue)
                            }
                            arr.unshift(i.text);
                        }
                    });
                    return arr.length ? arr.join(' - ') : '-';
                }
            }

            function returnLocaltion() {
                return callback(code);

                function callback(item) {
                    code = item ? item : code;
                    window._localtion.forEach(function(i) {
                        if (i.value == code) {
                            if (i.parentValue !== 0) {
                                callback(i.parentValue)
                            }
                            arr.push(i.name);
                        }
                    });
                    return arr.length ? arr.join(' - ') : '-';
                }
            }

        },
        getHumPhone: function(num) {
            var numA = num.substring(0, 3);
            var numB = num.substring(3, 7);
            var numC = num.substring(7, 11);
            return numA + '-' + numB + '-' + numC;
        },
        getHumDate: function(date, type) {
            var dateStr = '',
                Y, M, D, H, MI, S;
            if (typeof date != 'number' || typeof type !== 'string') {
                return dateStr = '-'
            }
            Y = new Date(date).getFullYear();
            M = new Date(date).getMonth() + 1;
            D = new Date(date).getDate();
            H = new Date(date).getHours();
            MI = new Date(date).getMinutes();
            S = new Date(date).getSeconds();
            M = M < 10 ? '0' + M : M;
            D = D < 10 ? '0' + D : D;
            H = H < 10 ? '0' + H : H;
            MI = MI < 10 ? '0' + MI : MI;
            S = S < 10 ? '0' + S : S;

            switch (type.toUpperCase()) {
                case 'S':
                    dateStr = Y + '/' + M + '/' + D + '  ' + H + ':' + MI + ':' + S;
                    break;
                case 'M':
                    dateStr = Y + '/' + M + '/' + D + '  ' + H + ':' + MI;
                    break;
                default:
                    dateStr = Y + '/' + M + '/' + D;
                    break;
            }
            return dateStr;
        },
        postParams: function(obj) {
            var param = '',
                i;
            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    if (!obj[i] && obj[i] != false) {
                        param += (i + '=' + '' + '&');
                    } else {
                        if (_.isArray(obj[i])) {
                            param += (i + '=' + obj[i].join() + '&');
                        } else {
                            param += (i + '=' + obj[i] + '&');
                        }
                    }
                }
            }
            var lastStr = param.lastIndexOf('&');
            if (lastStr) {
                param = param.substr(0, lastStr)
            }
            return param;
        },
        initQueryID: function($scope) {
            if (!$scope.industry) {
                $scope.industryID = '';
            }
            if (!$scope.localtion) {
                $scope.localtionID = '';
            }
            if (!$scope.areaCode) {
                $scope.areaCodeID = '';
            }
        },
        getServiceArea: function(code, obj) {
            var _l = window._localtionObj;
            var _lo = _l['0'];
            var i, provs = [],
                obj = {},
                len = _lo.length;
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
                            obj[j].str.push(i.name);
                        }
                    });
                }
            });
            for (var i in obj) {
                if (obj[i].str.length == 0) {
                    obj[i].str.push('全省、直辖市');
                }
                provs.push(obj[i].name);
            }

            var servicesArea = {
                obj: obj,
                provs: provs
            }
            return servicesArea;
        },
    
        checkData: function(obj, dic) {
            var str = '';
            if (!obj || !dic) {
                toaster.pop('error', '缺少必须的比对映射！');
                return false;
            }
            for (var i in obj) {
                if (!obj[i] && dic[i]) {
                    str += '【' + dic[i] + '】';
                }
                if (obj[i] && dic[i] && obj[i].length <= 0) {
                    str += '【' + dic[i] + '】';
                }
            }
            if (str == '') {
                return true;
            } else {
                str = str.substr(0, str.length) + ',没有正确填写，请检查';
                toaster.pop('error', str);
                return false;
            }
        },
        CtoH: function(str) { //todo
            // return str;
            var result = "";
            if (str) {
                for (var i = 0; i < str.length; i++) {
                    if (str.charCodeAt(i) == 12288) {
                        result += String.fromCharCode(str.charCodeAt(i) - 12256);
                        continue;
                    }
                    if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375) result += String.fromCharCode(str.charCodeAt(i) - 65248);
                    else result += String.fromCharCode(str.charCodeAt(i));
                }
            }
            return result;
        },
        treeData: function(rangeTree, options) {
            var codes = $rootScope.modules;
            var reg = /(c|d)\d+/gi;
            var dataDic = {};
            var _tempObj = {
                root: {
                    id: 'root',
                    pat: '',
                    children: []
                }
            };
            options = options || {};

            function processor(treeData, zIndex) {
                var tempArr = [];
                zIndex = zIndex || 2;

                function transformData(tree, processor, rate) {
                    tree.forEach(function(item, idx) {
                        rate = rate ? rate : 0;
                        // pid = pid ? pid : 0;
                        item['rate'] = rate + '_' + idx;
                        // item['pid'] = pid;
                        item['rateArr'] = item['rate'].split('_');
                        item['lv'] = item['rateArr'].length;
                        item['show'] = item['lv'] <= zIndex;
                        item['top'] = item['lv'] <= zIndex;
                        if (!item.children.length) {
                            item['class'] = 'glyphicon-menu-right';
                        } else {
                            item['class'] = 'glyphicon-plus';
                            item['spread'] = 'fold';
                        }
                        tempArr.push(item);
                        if (item.children) {
                            transformData(item.children, processor, item['rate']);
                        }
                    });
                }

                transformData(treeData, processor);
                return tempArr;
            }

            var i = 0,
                ii = 0;
            var len = rangeTree.length;
            var _obj = {}
            for (i; i < len; i++) {
                rangeTree[i]['rateArr'] = rangeTree[i].corpCode.match(reg);
                _obj[rangeTree[i].corpCode] = rangeTree[i];
            }
            for (ii; ii < len; ii++) {
                var j = 0,
                    jlen = rangeTree[ii]['rateArr'].length;
                for (j; j < jlen; j++) {
                    var str = rangeTree[ii]['rateArr'].slice(0, j + 1).join('');
                    if (_obj[str]) {
                        _obj[str]['pat'] = 'root';
                        break;
                    }
                }
            }
            rangeTree.forEach(function(item) {
                item['rateArr'] = item.corpCode.match(reg);
                item.children = item.children || [];
                if (item['pat'] == 'root' && item['rateArr'].length == 1) {
                    item['id'] = item['rateArr'][0];
                } else if (item['pat'] == 'root' && item['rateArr'].length > 1) {
                    item['id'] = item['rateArr'][item['rateArr'].length - 1];
                }
                if (item['pat'] !== 'root') {
                    item['pat'] = item['rateArr'][item['rateArr'].length - 2 <= 0 ? 0 : item['rateArr'].length - 2];
                    item['id'] = item['rateArr'][item['rateArr'].length - 1 <= 0 ? 0 : item['rateArr'].length - 1];
                }
                if (item['corpType'] == 1) {
                    switch (item['companyType']) {
                        case 1:
                            item['cropTypeName'] = '总公司';
                            break;
                        case 2:
                            item['cropTypeName'] = '分公司';
                            break;
                        case 3:
                            item['cropTypeName'] = '代理商';
                            break;
                        case 4:
                            item['cropTypeName'] = '联营公司';
                            break;
                    }
                } else {
                    item['cropTypeName'] = '部门';
                }
                if (options.selectHide) {
                    item['selectHide'] = item['corpType'] == 1;
                }
                item['selected'] = 'none';
                item['class'] = 'glyphicon-minus';
                item['search'] = 0;
                item['spread'] = 'none';
                item['isAddCompany'] = item['companyType'] == 1;
                item['isAddDepartment'] = 1;
                if (item['companyType'] == 3 || item['companyType'] == 4 || item['companyType'] == 1) {
                    item['isEdit'] = false;
                    item['isDel'] = false;
                } else {
                    item['isEdit'] = true;
                    item['isDel'] = true;
                }
                if (codes && codes.length) {
                    ['RcomCr', 'RdeCr', 'RdeUp', 'RcomUp', 'RdeDe', 'RcomDe'].forEach(function(itemCode) {
                        switch (itemCode) {
                            case 'RcomCr':
                                item['isAddCompany'] = codes.indexOf('RcomCr') !== -1 && item['isAddCompany'];
                                break;
                            case 'RdeCr':
                                item['isAddDepartment'] = codes.indexOf('RdeCr') !== -1 && item['isAddDepartment'];
                                break;
                            case 'RdeUp':
                                item['isEdit'] = codes.indexOf('RdeUp') !== -1 && item['isEdit'];
                                break;
                            case 'RcomUp':
                                item['isEdit'] = codes.indexOf('RcomUp') !== -1 && item['isEdit'];
                                break;
                            case 'RdeDe':
                                item['isDel'] = codes.indexOf('RdeDe') !== -1 && item['isDel'];
                                break;
                            case 'RcomDe':
                                item['isDel'] = codes.indexOf('RcomDe') !== -1 && item['isDel'];
                                break;
                            default:
                                break;
                        }
                    })
                }
                dataDic[item.id] = item;
            });
            rangeTree.forEach(function(item) {
                if (item.pat == 'root') {
                    _tempObj.root.children.push(item);
                } else {
                    if (!_tempObj[item.pat]) {
                        _tempObj[item.pat] = dataDic[item.pat] ? dataDic[item.pat].children : [];
                    }
                    _tempObj[item.pat].push(item);
                }
            });
            return processor(_tempObj.root.children);
        }
    }
}).factory('haha', function($document, $compile, $rootScope) {
    var body = $document.find('body');
    return {
        showWhat: function(elem, cb) {
            var container = angular.element('<h1 ng-click="cb1()">WHAT THE FUXK!!!!</h1>');
            var $scope = $rootScope.$new();
            body.after(container);
            $compile(container)($scope);
            $scope.cb1 = function() {
                cb('123213');
            }
        }
    }
});