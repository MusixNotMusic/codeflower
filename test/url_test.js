const parse_url = require('../lib/url_mid');
import { SingleSheet } from 'objxlsx'
let data = SingleSheet.parse('/Users/musix/Desktop/微博导出转发占比/11-top30.xlsx')
console.log('data ---> ', data)
let url = "http://www.weibo.com/5445663911/FkT9EjZ4B?from=pa…vr=6&mod=weibotime&type=comment#_rnd1507599567768";
let a = parse_url(url);
console.log(a);

function Weibo_str62to10(e) {
    var t = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var r = 0;
    for (var n = 0; n < e.length; n++) {
        var a = e.length - n - 1;
        var i = e[n];
        r += t.indexOf(i) * Math.pow(62, a)
    }
    return r
}

function Weibo_int10to62(e) {
    var t = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var r = "";
    var n = 0;
    while (e != 0) {
        n = e % 62;
        r = t[n] + r;
        e = Math.floor(e / 62)
    }
    return r
}

function Weibo_url2mid(e) {
    var t = "";
    for (var r = e.length - 4; r > -4; r -= 4) {
        var n = r < 0 ? 0 : r;
        var a = r + 4;
        var i = e.substring(n, a);
        i = Weibo_str62to10(i).toString();
        if (n > 0)
            while (i.length < 7)
                i = "0" + i;
        t = i + t
    }
    return t
}

function Weibo_miduid2url(e, t) {
    var r = "";
    for (var n = e.length - 7; n > -7; n = n - 7) {
        var a = n < 0 ? 0 : n;
        var i = n + 7;
        var o = e.substring(a, i);
        o = Weibo_int10to62(o);
        r = o + r
    }
    return "http://weibo.com/" + t + "/" + r
}
var getMidFromURL = function(e) {
    var t = "";
    for (var r = e.length - 4; r > -4; r -= 4) {
        var n = r < 0 ? 0 : r;
        var a = r + 4;
        var i = e.substring(n, a);
        i = Weibo_str62to10(i).toString();
        if (n > 0)
            while (i.length < 7)
                i = "0" + i;
        t = i + t
    }
    return t
};
var getURLFromMidUid = function(e, t) {
    var r = "";
    for (var n = e.length - 7; n > -7; n = n - 7) {
        var a = n < 0 ? 0 : n;
        var i = n + 7;
        var o = e.substring(a, i);
        o = Weibo_int10to62(o);
        r = o + r
    }
    return "http://weibo.com/" + t + "/" + r
};
var parseWeiboURL = function(e) {
    console.log('[Peep Url ===> ]', e)
    var b = '';
    b = e;
    var t;
    if (t = b.match(/^http\:\/\/(www\.|e.)?weibo\.com\/([0-9a-zA-Z\.\-\_]+)\/([0-9a-zA-Z\.\-\_]+)/)) {
        var r = t[2];
        var n = getMidFromURL(t[3]);
        // console.log(' [ r n ]', r, n)
        return {
            uid: r,
            mid: n
        }
    }
    return
};

console.log('url ==>', Weibo_int10to62(4149785784763001, 5445663911))