'use strict';

function saveOptions() {
    var get = function(id) {
        return document.getElementById(id);
    };
    var save = get('save');

    function setMessage(cName, message, callback) {
        var msgEl = get('message');

        msgEl.className = cName;
        msgEl.innerHTML = message;

        if (callback) {
            callback(msgEl);
        }
    }

    function saveToStore(amStart, amEnd, pmStart, pmEnd, interval) {
        console.log(interval);
        var opts = {
            amStart: amStart || 9,
            amEnd: amEnd || 12,
            pmStart: pmStart || 18,
            pmEnd: pmEnd || 24,
            interval: interval*1000 || 60000,
        };
        console.log(opts);
        store.set('options', JSON.stringify(opts));

        setMessage('green', '设置成功！', function(el) {
            var msgEl = el;
            setTimeout(function() {
                msgEl.className = '';
                msgEl.innerHTML = '';
            }, 2000);
        });
    }

    save.addEventListener('click', function() {
        var amStart = get('am-start').value;
        var amEnd = get('am-end').value;
        var pmStart = get('pm-start').value;
        var pmEnd = get('pm-end').value;
        var interval = get('interval').value

        console.log(amStart);
        console.log(amEnd);
        console.log(pmStart);
        console.log(pmEnd);
        console.log(interval);

        if (amStart === "" || amEnd === "" || pmStart === "" || pmEnd === "" || interval === "") {
            setMessage('green', '正常上下班的同志是好同志');
            saveToStore(amStart, amEnd, pmStart, pmEnd, interval);
        } else if (amStart > amEnd || pmStart > pmEnd) {
            setMessage('red', '请勿「反弹琵琶」放弃治疗');
        } else if (Number(amStart) < 0 || Number(amEnd) > 12) {
            setMessage('red', '请自行 Google「上午」的概念');
        } else if (Number(pmStart) < 12 || Number(pmEnd) > 24) {
            setMessage('red', '请自行 Google「下午」的概念');
        } else if ( Number(interval) < 5 ) {
            setMessage('red', '自虐狂的设置');
        } else {
            saveToStore(amStart, amEnd, pmStart, pmEnd, interval);
        }
    });
}
document.addEventListener('DOMContentLoaded', saveOptions);