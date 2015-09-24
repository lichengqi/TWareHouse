
// intervaltask: execute task in the interval.
function intervaltask (interval) {
    var me = this;
    me.queue = [];
    me.interval = interval;
    me._handler = function () {
        var task = me.queue.shift();
        if (!task) {
            if (me._id) {
                clearInterval(me._id);
                delete me._id;
            }
            return;
        }
        try {
            task();
        } catch(e) {
            console.log(e.stack);
        }
    };
}

intervaltask.prototype.addTask = function (task) {
    var me = this;
    me.queue.push(task);
    if (!me._id) {
        me._id = setInterval(me._handler, me.interval);
    }
};

module.exports = intervaltask;
