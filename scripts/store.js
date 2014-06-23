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