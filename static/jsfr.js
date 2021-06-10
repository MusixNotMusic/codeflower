var jsfr_initialize = function(a, r, i) {
    var t = 1;
    var v = 50;
    var e = 0;
    if (i != undefined) {
        if (i.size != undefined) t = i.size;
        if (i.speed != undefined) v = i.speed;
        if (i.gravity != undefined) e = i.gravity
    }
    var s = t * t;
    var n = 1e4;
    var h = 800;
    var f = 1e-6;
    var d = new Array;
    if (i != undefined && i.radius != undefined) {
        for (var o = 0; o < a; o++) {
            d.push([Math.random() * t, Math.random() * t, 0, 0, i.radius[o], 0, 0, 0])
        }
    } else {
        for (var o = 0; o < a; o++) {
            d.push([Math.random() * t, Math.random() * t, 0, 0, 1, 0, 0, 0])
        }
    }
    var M = Math.sqrt(n * s) / 10;
    var u = Math.sqrt(n * s) / (1 + a);
    if (i.k) u = i.k;
    var c = {
        k: u,
        size: t,
        speed: v,
        gravity: e,
        area: s,
        AREA_MULTIPLICATOR: n,
        SPEED_DIVISOR: h,
        epsilon: f,
        nodes: d,
        edges: r,
        anchors: i.anchors,
        append: function(a, r) {
            if (a == undefined) a = Math.random() * this.size;
            if (r == undefined) r = Math.random() * this.size;
            this.nodes.push([a + Math.random() - .5, r + Math.random() - .5, 0, 0, 0, 0, 0, 0])
        },
        iterate: function(a) {
            var r = this.size;
            var i = this.speed;
            var t = this.gravity;
            var v = this.area;
            var e = this.f;
            var s = this.AREA_MULTIPLICATOR;
            var n = this.SPEED_DIVISOR;
            var h = this.epsilon;
            var f = this.nodes;
            var d = this.edges;
            var o = this.anchors;
            var u = this.k;
            var c = f.length;
            for (var p = 0; p < c; p++) {
                f[p][2] = 0;
                f[p][3] = 0;
                f[p][7] = 0
            }
            for (var p = 0; p < c; p++) {
                for (var I = 0; I < c; I++) {
                    if (p == I) continue;
                    var l = f[p][0] - f[I][0];
                    var m = f[p][1] - f[I][1];
                    var g = Math.sqrt(l * l + m * m);
                    if (g < f[p][4] + f[I][4]) {
                        g *= Math.exp(g - (f[p][4] + f[I][4]))
                    }
                    if (g < h) g = h;
                    var e = u * u / g;
                    f[p][2] += l / g * e;
                    f[p][3] += m / g * e
                }
            }
            for (var z = 0; z < d.length; z++) {
                var p = d[z][0];
                var I = d[z][1];
                var A = f[p][0];
                var P = f[p][1];
                var _ = f[I][0];
                var q = f[I][1];
                var E, R, y, k;
                if (o) {
                    var x = o[z];
                    E = x[0] * Math.cos(f[p][6]) - x[1] * Math.sin(f[p][6]);
                    R = x[0] * Math.sin(f[p][6]) + x[1] * Math.cos(f[p][6]);
                    y = x[2] * Math.cos(f[I][6]) - x[3] * Math.sin(f[I][6]);
                    k = x[2] * Math.sin(f[I][6]) + x[3] * Math.cos(f[I][6]);
                    A += E;
                    P += R;
                    _ += y;
                    q += k
                }
                var l = A - _;
                var m = P - q;
                var g = Math.sqrt(l * l + m * m);
                if (g < h) g = h;
                var e = g * g / u;
                l = l / g * e;
                m = m / g * e;
                if (o) {
                    var D = -E * m + R * l;
                    var L = y * m - k * l;
                    f[p][7] += D;
                    f[I][7] += L
                }
                f[p][2] -= l;
                f[p][3] -= m;
                f[I][2] += l;
                f[I][3] += m
            }
            for (var p = 0; p < c; p++) {
                var l = f[p][0];
                var m = f[p][1];
                l = 0;
                var g = Math.sqrt(l * l + m * m);
                if (g < h) g = h;
                var e = .01 * u * t * g;
                f[p][2] -= l / g * e;
                f[p][3] -= m / g * e
            }
            for (var p = 0; p < c; p++) {
                f[p][2] *= i / n;
                f[p][3] *= i / n;
                f[p][7] *= i / n
            }
            for (var p = 0; p < c; p++) {
                var O = f[p][2];
                var S = f[p][3];
                var g = Math.sqrt(O * O + S * S);
                if (g < h) g = h;
                var T = Math.min(M * (i / n), g);
                var l = O / g * T;
                var m = S / g * T;
                var j = f[p][0] + l;
                var w = f[p][1] + m;
                if (!f[p][5]) {
                    f[p][0] = j;
                    f[p][1] = w
                }
                f[p][6] += f[p][7] * .001;
                while (f[p][6] < 0) f[p][6] += Math.PI * 2;
                while (f[p][6] > Math.PI * 2) f[p][6] -= Math.PI * 2
            }
        }
    };
    return c
};
var jsfr_run = function(a, r, i) {
    ctx = jsfr_initialize(a, r, i);
    for (var t = 0; t < a * 2; t++) ctx.iterate();
    return ctx.nodes
};