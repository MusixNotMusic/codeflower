/*
	start_time 起始时间 	毫秒
	diff       时间差 	天为单位
	pole       极		+/-1
*/

var time_limit = function(start_time /*millisecond*/ , diff /*天数*/ , pole) {
    var now = new Date().getTime()
    var msec = diff * 24 * 60 * 60 * 1000;
    var rtime;
    if (pole) {
        if (pole > 0) {
            if ((rtime = start_time + msec) > now) {
                return [start_time, now]
            } else {
                return [start_time, rtime]
            }
        } else {
            return [start_time - msec, start_time]
        }
    } else {
        return [start_time - msec, start_time]
    }
}

module.exports = time_limit;