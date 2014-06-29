'use strict';
var store = {
    get: function(name) {
        return localStorage.getItem(name);
    },
    set: function(name, val) {
        localStorage.setItem(name, val);
    },
    del: function(name) {
        localStorage.removeItem(name);
    }
};

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

// notifications
var Notify = {
    create: function(id, opts, callback) {
        id = id || '';
        chrome.notifications.create(id, opts, function(i) {
            console.log(i + ' is created.');
            if (callback) {
                callback(i);
            }
        });
    },
    clear: function(id, callback) {
        chrome.notifications.clear(id, function(isCleared) {
            if (callback) {
                callback(isCleared);
            } else {
                console.log(isCleared);
            }
        });
    },
    clearAll: function(callback) {
        var _this = this;
        this.getAll(function(o) {
            for (var n in o) {
                if (o.hasOwnProperty(n)) {
                    _this.clear(n);
                }
            }
            callback();
        });
    },
    getAll: function(callback) {
        chrome.notifications.getAll(function(o) {
            if (callback) {
                callback(o);
            } else {
                console.dir(o);
            }
        });
    }
};

// chrome.notifications.getAll(function(i) { console.dir(i) });
// chrome.notifications.create

var DK_BG = {
    init: function() {
        this.nowEl = get('now');
        this.amSignEl = get('am-sign');
        this.pmSignEl = get('pm-sign');
        this.goSignEl = get('go');

        this.isNotified = false;

        this.storeExpire();
        this.setDefaut();

        this.loopUpdateStatus();

    },
    loopUpdateStatus: function(ms) {
        var _this = this;
        var options = store.get('options');
        var opts = JSON.parse(options);
        var interval = Number(opts.interval);
        var week = new Date().getDay();
        var isWeekend = week == 6 || week == 0;

        this.dkUrl = opts.dkurl;

        if ( !isWeekend ) {
            _this.setBadgeNum();
            var timer = setInterval(function() {
                _this.storeExpire();
                _this.setDefaut();
                _this.setBadgeNum();
            }, interval || 60000);            
        }
    },
    storeExpire: function() {
        var now = new Date().getTime();
        var cacheTS = Number(store.get('DK_TS'));

        if (!cacheTS) {
            store.set('DK_TS', now);
        } else {
            var currDate = new Date().getDate();
            var cacheDate = new Date(cacheTS).getDate();

            // 明天
            if (currDate > cacheDate) {
                store.del('amSigned');
                store.del('pmSigned');
                store.set('DK_TS', now);
                try {
                    Notify.clearAll();
                } catch (e) {};
                this.isNotified = false;
            }
        }
    },
    setDefaut: function() {
        var defaultOptions = {
            amStart: 0,
            amEnd: 12,
            pmStart: 18,
            pmEnd: 24,
            interval: 60000,
            dkurl: 'http://www.jd.com'
        };

        if (!store.get('amSigned')) {
            store.set('amSigned', '0');
            store.set('pmSigned', '0');
        }
        if (!store.get('options')) {
            store.set('options', JSON.stringify(defaultOptions));
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
    setNotify: function() {
        var noId;
        var _this = this;
        if (this.onAM) {
            noId = 'amSign';
        }
        if (this.onPM) {
            noId = 'amSign';
        }

        chrome.notifications.create(noId, {
            type: 'basic',
            title: 'hello',
            message: 'world',
            iconUrl: 'images/icon-128.png'
        }, function() {});

        chrome.notifications.onClicked.addListener(function() {
            chrome.tabs.create({
                url: _this.dkUrl,
                active: true
            }, function() {
                _this.setSign();
                Notify.clear('amSign');
                Notify.clear('pmSign');
                this.isNotified = false;
            });
        });

        this.isNotified = true;
    },
    setSign: function() {
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

        this.setBadgeNum();
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
            if (!this.isNotified) {
                this.setNotify();
            }
        } else {
            chrome.browserAction.setBadgeText({
                text: ''
            });
        }
        console.log('updated');
    }
};



DK_BG.init();