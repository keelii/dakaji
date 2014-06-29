'use strict';

// 整数补零
function prefixInteger(num, length) {
    return (num / Math.pow(10, length)).toFixed(length).substr(2);
}

function getTimeStr(format) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hour = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    format = format || '{year}-{month}-{date} {hour}:{minutes}:{seconds}';

    return format
        .replace('{year}', year)
        .replace('{month}', month + 1)
        .replace('{date}', date)
        .replace('{hour}', prefixInteger(hour, 2))
        .replace('{minutes}', prefixInteger(minutes, 2))
        .replace('{seconds}', prefixInteger(seconds, 2));
}

var get = function(id) {
    return document.getElementById(id);
};

var DK_FE = {
    init: function() {
        var week = new Date().getDay();
        var isWeekend = week == 6 || week == 0;

        this.nowEl = get('now');
        this.amSignEl = get('am-sign');
        this.pmSignEl = get('pm-sign');
        this.goSignEl = get('go');

        this.setCurrentTime();
        this.setStatus(isWeekend);

        if ( !isWeekend ) {
            this.bindEvent();
        }
    },
    onAM: function() {
        var now = new Date();
        var h = now.getHours();
        var options = store.get('options');
        var opts = JSON.parse(options);
        var start = Number(opts.amStart);
        var end = Number(opts.amEnd);

        if (h >= start && h < end) {
            return true;
        } else {
            return false;
        }
    },
    onPM: function() {
        var now = new Date();
        var h = now.getHours();
        var options = store.get('options');
        var opts = JSON.parse(options);
        var start = Number(opts.pmStart);
        var end = Number(opts.pmEnd);

        if (h >= start && h < end) {
            return true;
        } else {
            return false;
        }
    },
    setStatus: function(isWeekend) {
        var amSigned = store.get('amSigned') === '1';
        var pmSigned = store.get('pmSigned') === '1';
        var isWeekend = isWeekend;

        if (isWeekend) {
            this.amSignEl.className = 'gray';
            this.amSignEl.innerHTML = '无需打卡';
            this.pmSignEl.className = 'gray';
            this.pmSignEl.innerHTML = '无需打卡';

            return;
        }

        if (amSigned) {
            this.amSignEl.className = 'gray';
            this.amSignEl.innerHTML = '已打卡';
        } else {
            this.amSignEl.className = 'red';
            this.amSignEl.innerHTML = '未打卡';
        }

        if (pmSigned) {
            this.pmSignEl.className = 'gray';
            this.pmSignEl.innerHTML = '已打卡';
        } else {
            this.pmSignEl.className = 'red';
            this.pmSignEl.innerHTML = '未打卡';
        }

        this.setBadgeNum();
    },
    bindEvent: function() {
        var _this = this;
        var opts = store.get('options');
        var options = JSON.parse(opts);
        var dkUrl = options.dkurl;

        this.goSignEl.setAttribute('href', dkUrl);
        this.goSignEl.onclick = function() {
            _this.goSign.call(_this);
        };
    },
    goSign: function() {
        var amSigned = store.get('amSigned') === '1';

        if (this.onAM()) {
            store.set('amSigned', '1');
        } else if (this.onPM()) {
            if (!amSigned) {
                store.set('amSigned', '1');
            } else {
                store.set('pmSigned', '1');
            }
        } else {
            if (!amSigned) {
                store.set('amSigned', '1');
            } else {
                store.set('pmSigned', '1');
            }
        }

        this.setStatus();
    },
    setBadgeNum: function() {
        var amSigned = parseInt(store.get('amSigned'), 10);
        var pmSigned = parseInt(store.get('pmSigned'), 10);
        var total = 0;
        if (this.onAM() && amSigned === 0) {
            total++;
        }
        if (this.onPM() && pmSigned === 0) {
            total++;
        }

        if (!this.onAM() && !this.onPM()) {
            if (amSigned === 0) {
                total++;
            }
        }

        if (total > 0) {
            chrome.browserAction.setBadgeText({
                text: '' + total
            });
        } else {
            chrome.browserAction.setBadgeText({
                text: ''
            });
        }
        console.log('updated');
    },
    setCurrentTime: function() {
        var el = this.nowEl;
        el.innerHTML = getTimeStr();

        var timer = setInterval(function() {
            el.innerHTML = getTimeStr();
        }, 1000);
    }
};

DK_FE.init();


console.log('无痛打卡，你值得拥有。');