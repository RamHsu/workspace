/**
 * 排序二维数组
 * @parameter index 按二维数组种的哪一位排序
 * */
Array.prototype.sortArray = function(index) {
    var arr = this,
        temp;
    for (var i = 0; i < arr.length - 1; i++) {
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i][index] > arr[j][index]) {
                temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
};

Array.prototype.distinct = function() {
    var dist = [],
        stringDist = [];
    for (var i = 0; i < this.length; i++) {
        if (stringDist.indexOf(JSON.stringify(this[i])) === -1) {
            dist.push(this[i]);
            stringDist.push(JSON.stringify(this[i]));
        }
    }
    return dist;
};

Array.prototype.find = function(func) {
    var array = this;
    if (typeof func !== "function") return;
    for (var i = 0; i < array.length; i++) {
        if (func.call(this, array[i], i, array)) return array[i];
    }
    return undefined;
};

Array.prototype.filter = function(func) {
    var array = this,
        newArray = [],
        obj;
    if (typeof func !== "function") return;
    for (var i = 0; i < array.length; i++) {
        obj = func.call(this, array[i], i, array);
        if (obj) newArray.push(array[i]);
    }
    return newArray;
};

Array.prototype.map = function(func) {
    var array = this,
        newArray = [];
    if (typeof func !== "function") return;
    for (var i = 0; i < array.length; i++) {
        newArray.push(func.call(this, array[i], i, array));
    }
    return newArray;
};

String.prototype.unescapeHTML = function() {
    var str = this;
    return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
};

String.prototype.startsWith = function(startStr) {
    var str = this;
    return str.substring(0, startStr.length) == startStr;
};

String.prototype.endsWith = function(endStr) {
    var str = this,
        regexp = new RegExp(endStr + "$");
    return regexp.test(str);
};

// 获取字符串的真实长度 中文算2 大写英文字母算2 英文算1
String.prototype.getRealLength = function() {
    var str = this;

    return str.replace(/[\u0391-\uFFE5 A-Z]/g, "aa").length;
};

// 截取字符串 传入的begin与end均为真实字符的位置 中文算2 英文算1
String.prototype.subRealString = function(begin, end) {
    var realLength = 0,
        str = this,
        len = str.length,
        charCode = -1,
        realBegin,
        realEnd;
    for (var i = 0; i < len; i++) {
        if (realBegin === undefined && realLength >= begin) realBegin = i;

        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;

        if (realLength >= end) {
            realEnd = i;
            return str.substring(realBegin, realEnd);
        }
    }
    return realLength;
};

// 转json对象
String.prototype.translateJSON = function() {
    try {
        return JSON.parse(this);
    } catch (e) {
        return false;
    }
};

// 是否是json字符串
String.prototype.isJsonStr = function() {
    try {
        var obj = JSON.parse(this);
        if (typeof obj === "object" && obj) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
};

/**
 * var str = "{0}你好，我是{1},我今年{2}岁了";
 * str.format({ 0: "Cupid", 1: "Tina", 2: 18 });
 * str.format(["Cupid", "Tina", 18]);
 * str.format("Cupid", "Tina", 18);
 */
String.prototype.format = function(obj) {
    var self = this;
    if (typeof obj === "object") {
        for (var attr in obj) {
            self = self.replace("{" + attr + "}", obj[attr]);
        }
        // return self.replace(/\{(\d+)\}/g, "");
        return self;
    } else {
        var arr = [].slice.call(arguments);
        return self.format(arr);
    }
};

// 去除左右空格
String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};

// 去除左侧空格
String.prototype.ltrim = function() {
    return this.replace(/(^\s*)/g, "");
};

// 去除右侧空格
String.prototype.rtrim = function() {
    return this.replace(/(\s*$)/g, "");
};

// 日期格式化
Date.prototype.Format = function(format) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        S: this.getMilliseconds() // millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(
            RegExp.$1,
            (this.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return format;
};

// 处理JS浮点数相加的BUG
Number.prototype.add = function(arg) {
    function accAdd(arg1, arg2) {
        var r1, r2, m;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return (arg1 * m + arg2 * m) / m;
    }

    return accAdd(arg, this);
};

// 转为财务格式
Number.prototype.outputmoney = function() {
    var numStr = this.toFixed(2),
        pointNum = "";
    if (numStr.indexOf(".") > 0) {
        var numArr = numStr.split(".");
        numStr = numArr[0];
        pointNum = "." + numArr[1];
    }
    if (numStr.length <= 3) return (numStr == "" ? "0" : numStr) + pointNum;
    else {
        var mod = numStr.length % 3;
        var output = mod == 0 ? "" : numStr.substring(0, mod);
        for (var i = 0; i < Math.floor(numStr.length / 3); i++) {
            if (mod == 0 && i == 0)
                output += numStr.substring(mod + 3 * i, mod + 3 * i + 3);
            else output += "," + numStr.substring(mod + 3 * i, mod + 3 * i + 3);
        }
        return output + pointNum;
    }
};

/**
 * 数值转换字符串
 * 例：
 * 12345670000转换为123.45亿
 * 3.1415926转换为3.14（默认保留2位小数，如传入limit参数，则根据limit来限制，0 <= limit <=3）
 * lan为枚举值：["zh", "en"]
 * */
Number.prototype.transform = function(limit, lan) {
    var num = this,
        limitFlag = (num + "").indexOf(".") !== -1,
        intLen = 0,
        result = "";
    // 检查参数合法性
    if (limit < 0 || limit > 3) limit = 2;
    if (lan !== "zh" && lan !== "en") lan = "zh";
    // 获取整数部分长度
    if (limitFlag) {
        intLen = (num + "").indexOf(".");
    } else {
        intLen = (num + "").length;
    }
    if (intLen > 4) {
        if (lan === "zh") {
            if (intLen > 12) {
                num = num / 1000000000000;
                result = (num + "").substr(
                    0,
                    intLen - 12 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "兆";
            } else if (intLen > 8) {
                num = num / 100000000;
                result = (num + "").substr(
                    0,
                    intLen - 8 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "亿";
            } else if (intLen > 4) {
                num = num / 10000;
                result = (num + "").substr(
                    0,
                    intLen - 4 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "万";
            }
        } else if (lan === "en") {
            if (intLen > 9) {
                num = num / 1000000000;
                result = (num + "").substr(
                    0,
                    intLen - 9 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "billion";
            } else if (intLen > 6) {
                num = num / 1000000;
                result = (num + "").substr(
                    0,
                    intLen - 6 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "million";
            } else if (intLen > 3) {
                num = num / 1000;
                result = (num + "").substr(
                    0,
                    intLen - 3 + (limit === 0 ? 0 : limit + 1)
                );
                result = result.replace(/\.0+$/, "") + "thousand";
            }
        }
    } else {
        result =
            result +
            (num + "").substr(0, intLen + (limit === 0 ? 0 : limit + 1));
    }
    return result;
};

window.globalMethods = {
    // 获取dom的样式
    getStyle: function(element, attr) {
        var value = null;
        try {
            value = window.getComputedStyle(element, null)[attr];
        } catch (e) {
            value = element.currentStyle[attr];
        }
        return value;
    },
    // 获取浏览器信息
    getBrowserInfo: function() {
        var userAgent = navigator.userAgent.toLocaleLowerCase(),
            currentBrowser,
            currentVersion,
            s;
        (s = userAgent.match(/msie ([\d.]+)/))
            ? ((currentBrowser = "ie"), (currentVersion = s[1]))
            : (s = userAgent.match(/firefox\/([\d.]+)/))
            ? ((currentBrowser = "firefox"), (currentVersion = s[1]))
            : (s = userAgent.match(/chrome\/([\d.]+)/))
            ? ((currentBrowser = "chrome"), (currentVersion = s[1]))
            : (s = userAgent.match(/opera.([\d.]+)/))
            ? ((currentBrowser = "opera"), (currentVersion = s[1]))
            : (s = userAgent.match(/version\/([\d.]+).*safari/))
            ? ((currentBrowser = "safari"), (currentVersion = s[1]))
            : (s = userAgent.match(/qqbrowser\/([\d.]+)/))
            ? ((currentBrowser = "qqie"), (currentVersion = s[1]))
            : (s = userAgent.match(/rv:([\d.]+)/))
            ? ((currentBrowser = "ie"), (currentVersion = s[1]))
            : 0;

        return {
            browser: currentBrowser,
            version: currentVersion
        };
    },
    // 获取浏览器语言
    getBrowserLanguage: function() {
        var curLang = navigator.language || navigator.browserlanguage || "";
        if (curLang.startsWith("zh-")) return "chinese";
        else return "english";
    }
};