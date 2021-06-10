// node color #fe3184
// line color #a8ddfd
// background color #fff
var nodes = null;
var llinks = [];
// var childTable = {};
// var srcData = {},
// root = null;
// var check_reqeat_data = [],
// mergerQueue;
// default  node color orange  |  line Color green | background color  rgb(04,32,41) 
var data_tree;
var cf_size = -1;
var cf_total = -1;
var transform = d3.zoomIdentity;
var codeflower = function() {
    // var nodes;
    // var llinks = [];
    // var childTable = {};
    // var srcData = {},
    //     root = null;
    // var check_reqeat_data = [],
    //     mergerQueue;
    var zoomK = 1; // 初始缩放大小
    var canvas = d3.select("#base");
    var context = canvas.node().getContext("2d"),
        width = -1,
        height = -1,
        offsetTop = -1,
        offsetLeft = -1
        // transform = d3.zoomIdentity;


    var openDialog = false;
    var window_dx = 250;
    var canvasC = document.getElementById('console');
    contextConsole = canvasC.getContext("2d");

    var canvasL = document.getElementById('loop');
    var contextLoop = canvasL.getContext('2d')
    var canvasPre = document.getElementById('precircle');
    var contextPre = canvasPre.getContext('2d')
    var message = document.getElementById('move_message')

    function recover_param() {
        console.log(transform);
        data_tree = {};
        filterRecords = null;
        label_nodes = null;
        nodes = null;
        gender_queue = { m: [], f: [] };
        verified_queue = { generalV: [], yellowV: [], blueV: [] };
        main_list = [];
        Rz = 80;
        m = 100;
        zoomK = -1;
        lockNode = null;
        llinks = [];
        transform.x = 0;
        transform.y = 0;
        cf_size = -1;
        cf_total = -1;
        current_position = 1;
        context.clearRect(0, 0, width, height);
        contextLoop.clearRect(0, 0, width, height);
        contextPre.clearRect(0, 0, width, height);
        contextConsole.clearRect(0, 0, width, height);
    }

    // var data_tree = {}

    function launch(ret) {
        recover_param()
            // console.log("launch===>", launch)
        selfAdpter('main');
        // 测试
        cf_size = ret.data.data.length;
        cf_total = ret.total_number | 0;
        console.log('ret cf_size cf_total ', ret, cf_size, cf_total)
        data_tree = init(ret.data.data, ret.data.fields)
        layout_circular(data_tree);
        nodes = Object.values(data_tree.nodes);

        canvas
            .on("mousemove", mousemoved)
            .on("click", click)
            .call(d3.drag().subject(dragsubject).on("drag", canvasDragged).on("end", ended))
            .call(d3.zoom().scaleExtent([1 / 32, 2]).on("zoom", zoomed))
            .call(initForce)
            .on("dblclick.zoom", null)
            .on("click.drag", null)
            .on("click.zoom", null);
    }





    var globalStatus = { status: { mousemoved: false }, lockId: null };

    function saveStatus(eventType, eventStatus) {
        if (!globalStatus[eventType]) globalStatus[eventType] = {};
        globalStatus[eventType] = eventStatus;
        globalStatus.status[eventType] = true;
    }
    /*****************************Layout*************************************/
    function selfAdpter(clazz) {
        // main-mid
        // var base = document.getElementsByTagName('body')[0]
        var base = document.getElementsByClassName(clazz)[0];
        var svg = document.getElementById('drawLine');
        var client_width = base.clientWidth;
        var client_height = base.clientHeight;
        // console.log(client_width, client_height);
        width = client_width;
        height = client_height;
        offsetTop = base.offsetTop;
        offsetLeft = base.offsetLeft;
        svg.setAttribute('width', client_width);
        svg.setAttribute('height', client_height);
        // var ratio = 2;
        // / window.devicePixelRatio;
        if (!document.cookie.includes('mac')) {
            context.canvas.width = client_width;
            context.canvas.height = client_height;
            context.canvas.style.width = client_width + 'px';
            context.canvas.style.height = client_height + 'px';
            canvasC.width = client_width;
            canvasC.height = client_height;
            canvasC.style.width = client_width + 'px';
            canvasC.style.height = client_height + 'px';
            canvasPre.width = client_width;
            canvasPre.height = client_height;
            canvasPre.style.width = client_width + 'px';
            canvasPre.style.height = client_height + 'px';
            canvasPre.style.background = 'aliceblue';
            canvasL.width = client_width;
            canvasL.height = client_height;
            canvasL.style.width = client_width + 'px';
            canvasL.style.height = client_height + 'px';
        } else {
            context.canvas.width = client_width * 2;
            context.canvas.height = client_height * 2;
            context.canvas.style.width = client_width + 'px';
            context.canvas.style.height = client_height + 'px';
            canvasC.width = client_width * 2;
            canvasC.height = client_height * 2;
            canvasC.style.width = client_width + 'px';
            canvasC.style.height = client_height + 'px';
            canvasPre.width = client_width * 2;
            canvasPre.height = client_height * 2;
            canvasPre.style.width = client_width + 'px';
            canvasPre.style.height = client_height + 'px';
            canvasPre.style.background = 'aliceblue';
            canvasL.width = client_width * 2;
            canvasL.height = client_height * 2;
            canvasL.style.width = client_width + 'px';
            canvasL.style.height = client_height + 'px';
        }
    }


    function link() {
        let l, nodes = Object.values(data_tree.nodes);
        console.log('data_tree', data_tree, layout_circular_scale);
        for (l = 1; l < nodes.length; l++) {
            // if(nodes[srcData[srcData[nodes[l].id].parent].index])
            llinks.push({
                target: nodes[l],
                source: data_tree.nodes[nodes[l].parent],
                counter: 0
            })
        }
    }

    function init(data, fields) {
        var d, f,
            //  初始化数据 去除重复数据
            lenD = data.length,
            lenF = fields.length,
            obj, childQ = [];
        var srcData = {},
            childTable = {};
        console.log('Length ====> ', lenD, lenF)
        for (d = 0; d < lenD; d++) {
            obj = {}
            if (data[d]) {
                for (f = 0; f < lenF; f++) {
                    obj[fields[f]] = data[d][f];
                }
            } else {
                continue;
            }
            // 存在重复数据的时候，把数据剔除，但是给对象赋值index 会造成不连续
            obj.children = [];
            srcData[obj.id] = obj
        }

        // 时间排序
        var r = [];
        for (var t in srcData)
            r.push(t);
        r.sort(function(r, t) {
            return new Date(srcData[r].t).getTime() - new Date(srcData[t].t).getTime()
        });
        root = srcData[r[0]].id;
        srcData[r[0]].parent = null;
        console.log('Root =====> ', r[0], root, srcData[r[0]]);
        // 时间排序


        // 释放引用
        data = null;
        var srcArr = Object.values(srcData),
            single;
        // 创建 childTable， 分配与nodes llinks 关联的index
        for (var ii = 0; ii < srcArr.length; ii++) {
            single = srcArr[ii]
            if (single.parent) {
                if (childTable[single.parent] == undefined) {
                    childTable[single.parent] = [];
                    childTable[single.parent].push(single.id); // shit 
                } else {
                    childTable[single.parent].push(single.id);
                }
            }

            // if (single.parent == null) {
            //     root = single.id;
            // }
        }
        // 释放内存引用
        srcArr = null;
        console.log('非源级srcData', srcData);
        for (var key in childTable) {
            if (srcData[key] && childTable[key].length > 0) {
                srcData[key].children = childTable[key]
                    // }
            } else {
                /*
                 *  转发过程中，由于某些原因，转发节点被删除(Op)，但是
                 *  子节点没有处理(Cs)，无法分析传播路径, 避免子节点下还有节点,
                 *  不能删除(Cs),因此将子节点放到root下
                 *  // TODO  标记被删除节点的个数
                 */
                // console.log('[childTable]=====>' , key ,childTable[key])
                for (d = 0; d < childTable[key].length; d++) {
                    srcData[childTable[key][d]].parent = root
                        // console.log('[Assign to root]', root, root.children, srcData[childTable[key][d].id])
                    srcData[root].children.push(childTable[key][d])
                }
            }
            // counter += childTable[key].length;
            // console.log('children Len:',childTable[key].length, counter)
        }
        // childTable 释放引用
        childTable = null;
        console.log('srcData', srcData);
        var tmin = 1e100;
        var tmax = -1e100;
        var data_tree = {};
        data_tree.start = tmin;
        data_tree.end = tmax;
        data_tree.nodes = srcData;
        // srcData 释放引用
        srcData = null;
        console.log(data_tree);
        data_tree = function(e) {
            var r = {
                start: e.start,
                end: e.end,
                nodes: {}
            };
            var index = 0;
            for (var t in e.nodes) {
                var a = e.nodes[t];
                var n = a.text;
                if (n == "转发微博" || n == "转发" || n.toLowerCase() == "repost")
                    n = "";
                r.nodes[t] = {
                    id: t,
                    uid: a.uid,
                    mid: a.mid,
                    type: a.type,
                    t: a.t,
                    children: [],
                    text: n,
                    words: a.words,
                    comments_count: a.comments_count,
                    reposts_count: a.reposts_count,
                    username: a.username,
                    followers_count: a.followers_count,
                    verified_type: a.verified_type,
                    city: a.city,
                    province: a.province,
                    gender: a.gender,
                    emotion: a.emotion,
                    p: a.parent,
                    index: index,
                    counter: 0,
                    user_avatar: a.user_avatar,
                };
                index++;
                for (var o in a.children) {
                    var i = a.children[o];
                    r.nodes[t].children.push(i)
                }
                r.nodes[t].children.sort(function(r, t) {
                    return e.nodes[r].t - e.nodes[t].t
                })
            }
            for (var t in r.nodes) {
                for (var o in r.nodes[t].children) {
                    r.nodes[r.nodes[t].children[o]].parent = t
                }
                r.nodes[t].children_count = r.nodes[t].children.length;
                r.nodes[t].text_length = r.nodes[t].text.length
            }

            return r
        }(data_tree);
        // console.log('second ===> ', data_tree)
        (function() {
            var e = function(r) {
                if (!r.parent) {
                    r.level = 0;
                    return 0
                }
                var t = e(data_tree.nodes[r.parent]) + 1;
                r.level = t;
                return t
            };
            for (var r in data_tree.nodes) {
                e(data_tree.nodes[r])
            }
        })();
        var root_nodes = [];
        for (var id in data_tree.nodes) {
            var n = data_tree.nodes[id];
            if (!n.parent)
                root_nodes.push(id)
        }
        var max_children_count = 0;
        for (var i in data_tree.nodes) {
            if (data_tree.nodes[i].children.length > max_children_count) {
                max_children_count = data_tree.nodes[i].children.length
            }
        }
        return data_tree;
    }


    var layout_circular_scale;
    var layout_circular_recompute;
    var layout_circular_save_skeleton;
    var layout_circular_load_skeleton;
    var layout_circular_get_position;
    var layout_circular_threshold = 50;
    var layout_circular_threshold_attribute = null;
    var layout_circular = function(e) {
        var r = [];
        for (var t in e.nodes)
            r.push(t);
        r.sort(function(r, t) {
            return new Date(e.nodes[r].t).getTime() - new Date(e.nodes[t].t).getTime()
        });

        var root = Object.keys(data_tree.nodes)[0];
        for (var i = 1; i < r.length; i++) {
            if (!data_tree.nodes[r[i].p]) {
                r[i].p = root;
                r[i].parent = root;
            }
        }

        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            n.x = undefined;
            n.y = undefined;
            n.circular_expand = false;
            n.occupy_count = false;
            n.total_nodes = false;
            n.count_depth_cache = false
        }
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (layout_circular_threshold_attribute) {
                if (n[layout_circular_threshold_attribute] > layout_circular_threshold || t == 0)
                    n.circular_expand = true
            } else {
                if (n.children.length > layout_circular_threshold || t == 0)
                    n.circular_expand = true
            }
        }
        var o = function(r) {
            if (r.occupy_count)
                return r.occupy_count;
            var t = 1;
            var a = 0;
            for (var n in r.children) {
                var i = e.nodes[r.children[n]];
                if (!i.circular_expand)
                    a += o(i)
            }
            return r.occupy_count = Math.max(t, a)
        };
        var i = function(r) {
            if (r.total_nodes)
                return r.total_nodes;
            var t = 1;
            for (var a in r.children) {
                var n = e.nodes[r.children[a]];
                if (!n.circular_expand)
                    t += i(n)
            }
            return r.total_nodes = t
        };
        var s = function(r) {
            if (r.count_depth_cache)
                return r.count_depth_cache;
            var t = 1;
            for (var a in r.children) {
                var n = e.nodes[r.children[a]];
                if (!n.circular_expand) {
                    var o = s(n) + 1;
                    if (t < o)
                        t = o
                }
            }
            return r.count_depth_cache = t
        };
        var l = function(e) {
            var r = 1 - Math.exp(-s(e) / 3);
            return r * (Math.pow(i(e), .5) / 10 + 1)
        };
        var d = function(r, t, a, n) {
            if (n === undefined)
                n = 0;
            var i = l(r);
            var s = 0;
            var d = function(r, l, c, v) {
                var u = 0;
                var f = 0;
                for (var _ in r.children) {
                    var h = e.nodes[r.children[_]];
                    if (!h.circular_expand) {
                        u++;
                        f += o(h)
                    }
                }
                var g = false;
                if (l == 1) {
                    v = Math.PI * 2 * u / 100;
                    v = Math.min(v, Math.PI * 5);
                    if (v < Math.PI * 2) {
                        v = Math.PI * 2;
                        g = true
                    }
                }
                var p = c - v / 2;
                var m = c + v / 2;
                var w = 0;
                var x = function(e) {
                    return 1 - Math.exp(-e / 3)
                };
                var y = 0;
                for (var _ in r.children) {
                    var h = e.nodes[r.children[_]];
                    if (h.circular_expand == false) {
                        y += o(h) / 2;
                        var b = y / f * (m - p) + p;
                        var k = 0;
                        var C = 1;
                        if (l == 1 && !g) {
                            k = -(u - (w + .5)) / u * (x(l) - x(l - 1)) * .5;
                            C = -(u - (w + .5)) / u * .5 + 1
                        }
                        var $ = i * (x(l) + k);
                        h.x = t + $ * Math.cos(b + n);
                        h.y = a + $ * Math.sin(b + n);
                        if ($ > s) {
                            s = $
                        }
                        var E = v * o(h) / f * .8;
                        E = Math.min(Math.PI / 4, E);
                        d(h, l + C, b, E);
                        y += o(h) / 2;
                        w++
                    }
                }
            };
            r.x = t;
            r.y = a;
            d(r, 1, 0);
            r.max_distance = s;
            i *= i / (s + .1);
            d(r, 1, 0)
        };
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (n.circular_expand) {
                d(n, 0, 0)
            }
        }
        var c = [];
        var v = [];
        var u = [];
        var f = [];
        var _ = 0;
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (n.circular_expand) {
                n.fr_algo_id = c.length;
                n.circular_radius = l(n);
                c.push(n);
                v.push(n.circular_radius * 1.2);
                _ += n.circular_radius
            } else {
                n.circular_radius = 1;
            }
        }
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (n.circular_expand) {
                var h = n.parent ? e.nodes[n.parent] : null;
                var g = h;
                while (h && h.circular_expand == false)
                    h = e.nodes[h.parent];
                if (h) {
                    u.push([h.fr_algo_id, n.fr_algo_id]);
                    f.push([g.x - h.x, g.y - h.y, 0, 0])
                }
            }
        }
        var p = jsfr_initialize(c.length, u, {
            radius: v,
            anchors: f,
            k: _ / c.length * 10
        });
        p.nodes[0][0] = 0;
        p.nodes[0][1] = 0;
        p.nodes[0][5] = 1;
        for (var t = 1; t < c.length; t++) {
            var m = Math.PI * 2 * t / c.length;
            p.nodes[t][0] = Math.cos(m);
            p.nodes[t][1] = Math.sin(m)
        }
        p.k = _ / c.length * .1;
        for (var t = 0; t < c.length * 20 + 20; t++)
            p.iterate();
        p.k = _ / c.length * 10;
        for (var t = 0; t < c.length * 20 + 20; t++)
            p.iterate();
        p.k = _ / c.length;
        for (var t = 0; t < c.length * 50 + 200; t++)
            p.iterate();
        for (var t in p.nodes) {
            c[t].x = p.nodes[t][0];
            c[t].y = p.nodes[t][1];
            c[t].rotation = p.nodes[t][6]
        }
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (n.circular_expand) {
                d(n, n.x, n.y, n.rotation)
            }
        }
        var w = 1e100,
            x = -1e100;
        var y = 1e100,
            b = -1e100;
        for (var a in e.nodes) {
            var n = e.nodes[a];
            if (y > n.x)
                y = n.x;
            if (b < n.x)
                b = n.x;
            if (w > n.y)
                w = n.y;
            if (x < n.y)
                x = n.y
        }
        if (x - w > b - y) {
            var k = (y + b) / 2;
            b = k + (x - w) / 2;
            y = k - (x - w) / 2
        } else {
            var C = (w + x) / 2;
            x = C + (b - y) / 2;
            w = C - (b - y) / 2
        }
        layout_circular_scale = 1 / (b - y);
        for (var a in e.nodes) {
            var n = e.nodes[a];
            n.x = (n.x - y) / (b - y) * height
            n.y = (n.y - w) / (x - w) * height - height / 4;
        }
        layout_circular_recompute = function() {
            for (var t in e.nodes) {
                var a = e.nodes[t];
                a.x = a.x * (b - y) + y;
                a.y = a.y * (x - w) + w;
                a.total_nodes = undefined;
                a.occupy_count = undefined;
                a.count_depth_cache = undefined
            }
            for (var n in r) {
                var t = r[n];
                var a = e.nodes[t];
                if (a.circular_expand) {
                    a.circular_radius = l(a);
                    d(a, a.x, a.y, a.rotation)
                }
            }
            for (var t in e.nodes) {
                var a = e.nodes[t];
                a.x = (a.x - y) / (b - y);
                a.y = (a.y - w) / (x - w)
            }
        };
        layout_circular_get_position = function(e) {
            var r = e.x * (b - y) + y;
            var t = e.y * (x - w) + w;
            return {
                x: r,
                y: t,
                radius: l(e)
            }
        };
        layout_circular_save_skeleton = function() {
            var r = {};
            for (var t in e.nodes) {
                var a = e.nodes[t];
                if (a.circular_expand) {
                    var n = a.x * (b - y) + y;
                    var o = a.y * (x - w) + w;
                    r[t] = {
                        x: n,
                        y: o,
                        rotation: a.rotation,
                        radius: l(a)
                    }
                }
            }
            return r
        };
        layout_circular_load_skeleton = function(r) {
            for (var t in e.nodes) {
                var a = e.nodes[t];
                if (r[t]) {
                    var n = r[t];
                    a.circular_expand = true;
                    a.x = (n.x - y) / (b - y);
                    a.y = (n.y - w) / (x - w);
                    a.rotation = n.rotation
                } else {
                    a.circular_expand = false
                }
            }
            layout_circular_recompute()
        }
    }

    var layout_tree = function(e) {
        var r = [];
        for (var t in e.nodes)
            r.push(t);
        r.sort(function(r, t) {
            return new Date(e.nodes[r].t).getTime() - new Date(e.nodes[t].t).getTime()
        });
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            n.x = undefined;
            n.y = undefined;
            n.occupy_count = false;
            n.total_nodes = false
        }
        var o = function(r) {
            if (r.occupy_count)
                return r.occupy_count;
            var t = 1;
            var a = 0;
            for (var n in r.children) {
                a += o(e.nodes[r.children[n]])
            }
            return r.occupy_count = Math.max(t, a)
        };
        var i = function(e) {
            return Math.log(1 + 10 * e)
        };
        var s = function(r, t, a, n) {
            var l = a - n / 2;
            var d = a + n / 2;
            var c = 0;
            for (var v in r.children) {
                var u = e.nodes[r.children[v]];
                c += o(u)
            }
            c += 2;
            var f = 1;
            for (var v = r.children.length - 1; v >= 0; v--) {
                var u = e.nodes[r.children[v]];
                f += u.occupy_count / 2;
                var _ = f / c * (d - l) + l;
                u.x = t;
                u.y = _;
                s(u, t + i(u.children.length), _, u.occupy_count / c * n);
                f += u.occupy_count / 2
            }
        };
        for (var t in r) {
            var a = r[t];
            var n = e.nodes[a];
            if (!n.y) {
                n.x = 0;
                n.y = 0;
                s(n, i(n.children.length), 0, Math.PI)
            }
        }
        var l = 0,
            d = .001;
        var c = 0,
            v = .001;
        for (var a in e.nodes) {
            var n = e.nodes[a];
            if (c > n.x)
                c = n.x;
            if (v < n.x)
                v = n.x;
            if (l > n.y)
                l = n.y;
            if (d < n.y)
                d = n.y
        }
        for (var a in e.nodes) {
            var n = e.nodes[a];
            n.x = (n.x - c) / (v - c) * height / 2;
            n.y = (n.y - l) / (d - l) * height / 2;
        }
    };

    var layout_radiate = function(data_tree) {
        var PI = Math.PI,
            sin = Math.sin,
            cos = Math.cos,
            asin = Math.asin;

        var period_layout = [];

        var r = [];
        for (var t in data_tree.nodes)
            r.push(t);
        r.sort(function(r, t) {
            return new Date(data_tree.nodes[r].t).getTime() - new Date(data_tree.nodes[t].t).getTime()
        });

        function generate(node) {
            if (node.children.length > 0) {
                for (var i = 0; i < node.children.length; i++) {
                    if (data_tree.nodes[node.children[i]].children) {
                        period_layout.push(data_tree.nodes[node.children[i]])
                        generate(data_tree.nodes[node.children[i]])
                    } else {
                        period_layout.push(data_tree.nodes[node.children[i]])
                    }
                }
            }
        }

        function assignPosition(R, n, size) {
            // console.log('assignPosition', n)
            var degree = 2 * PI / size
            var x1 = R * sin(degree * n) + width / 4;
            var y1 = height / 4 - R * cos(degree * n);
            return [x1, y1]
        }
        // 半径
        // 一个周长的比例
        // ß = 2 * asin(r0/R0)  2*PI/ß = size
        // R0 = r0/sin(PI/size)
        function adapter(size, r0) {
            return r0 / sin(PI / (size * 3 / 14))
        }

        function lower_limit(cursor, deep) {
            if (deep === 1 && cursor < period_layout.length) cursor--;
            for (; period_layout[cursor] && depth(period_layout[cursor].id) !== 1 && cursor < period_layout.length; cursor--);
            return cursor;
        }

        function upper_limit(cursor, deep) {
            if (deep === 1 && cursor < period_layout.length) cursor++;
            for (; period_layout[cursor] && depth(period_layout[cursor].id) !== 1 && cursor < period_layout.length; cursor++);
            return cursor;
        }

        // cursor1, cursor2  向下取膜 (cursor1+cursor2)/2
        function align_center(cursor, deep) {
            var limit = upper_limit(cursor, deep)

            for (var m = cursor + 1; m < limit; m++) {
                if (deep === period_layout[m].level) {
                    // console.log('[cursor&m]', cursor, m, cursor-m,~~((cursor+m)/2))
                    return ~~((cursor + m) / 2)
                }
            }
            return (cursor + limit) / 2;
        }

        var _coord, R, deep, Rc, center_i;

        (function coordinate() {
            // var nodes = Object.values(data_tree.nodes);
            var root = data_tree.nodes[r[0]];
            root.x = width / 4;
            root.y = height / 4;
            generate(root)
            R = adapter(nodes.length, 15) / 25;
            // Rc = (Math.pow(5,1/2)-1)/2*R
            Rc = .2 * R
            for (var i = 0, len = period_layout.length - 1; i < len; i++) {
                deep = period_layout[i].level;
                center_i = align_center(i, deep)
                _coord = assignPosition(R + (deep - 1) * Rc, center_i, nodes.length)
                period_layout[i].x = _coord[0]
                period_layout[i].y = _coord[1]
            }
        })()
    }

    function recursiveChildren(mouse, node) {
        var child = node.children
            // console.log(child);
        if (child) {
            var vectorX = transform.invertX(mouse[0]) - d3.event.subject.x;
            var vectorY = transform.invertY(mouse[1]) - d3.event.subject.y;
            for (var i = 0, len = child.length; i < len; i++) {
                data_tree.nodes[child[i]].x += vectorX;
                data_tree.nodes[child[i]].y += vectorY;
                recursiveChildren(mouse, data_tree.nodes[child[i]]);
            }
        }
    }

    /*****************************Layout*************************************/

    function initForce() {
        // var date = new Date().getTime()
        console.log("initForce");
        link();
        transform.k = 1;
        transform.x = width / 4
        transform.y = height / 4

        render()
        Dragging(getDraggingDialog).enable();
        var _close = getDom('close')
        _close.addEventListener('click', unmarkWindow)
            // console.log('time ====>', (new Date().getTime() - date)/1000)
    }

    /*****************************EVENT*************************************/
    function canvasDragged() {
        console.log('drag')
        closeWindow(this.nextElementSibling)
        contextLoop.clearRect(0, 0, width, height)
        var mouse = d3.mouse(this)
        drawPreCircle(mouse);
    }

    function ended() {
        console.log('ended');
        var mouse = d3.mouse(this)
        var node = data_tree.nodes[d3.event.subject.id]
        recursiveChildren(mouse, node)
        d3.event.subject.x = transform.invertX(mouse[0])
        d3.event.subject.y = transform.invertY(mouse[1])
        contextPre.clearRect(0, 0, width, height)
        render();
    }

    function drawPreCircle(d) {
        contextPre.clearRect(0, 0, width, height)
        contextPre.beginPath();
        contextPre.moveTo(d[0], d[1]);
        contextPre.arc(d[0], d[1], /*keyword2Radius(d)*/ 5, 0, 2 * Math.PI);
        contextPre.fillStyle = "orange";
        contextPre.fill();
    }

    // var stopX=-1, stopY=-1, stopK = -1;
    function zoomed() {
        console.log('zoomed')
        transform = d3.event.transform;
        render();
        // console.log('zoomed render time ======> ', (new Date().getTime() - start) / 1000)
    }

    function dragsubject() {
        // console.log('dragsubject')
        var d = findNode(this)
        if (d) return d;
    }

    function mousemoved() {
        // console.log('mousemoved')
        var span = this.parentNode;
        var cc = document.getElementById('base')
        var d = findNode(this);
        var dom = this.nextElementSibling
        contextLoop.clearRect(0, 0, width, height);
        if (!d) {
            if (globalStatus.status.mousemoved) {
                clearStatus('mousemoved')
            }
            closeWindow(dom)
            return span.removeAttribute("href"), span.removeAttribute("title")
        };
        drawMessage(dom, d);
        // if(!globalStatus.status.mousemoved)
        mouseEventChian(d, 0)
    }

    function click() {
        console.log('click')
        var d = findNode(this)
        if (d) {
            lockNode = d;
            openDialog = true
                // init 
            initDialogData(d);
            openWindow(dialog)
            if (!d.isMark) {
                clickEventChain(d)
            } else {
                showDialog(d)
            }
        } else {
            if (openDialog) {
                closeWindow(dialog)
                openDialog = false
                contextConsole.clearRect(0, 0, width, height)
            }
        }
    }
    var line = d3.line()
        .curve(d3.curveBasis);

    var svg = d3.select("svg")
        .call(d3.drag()
            .container(function() { return this; })
            .subject(function() { var p = [d3.event.x, d3.event.y]; return [p, p]; })
            .on("start", dragstarted));


    function dragstarted() {
        var d = d3.event.subject,
            active = svg.append("path").datum(d),
            x0 = d3.event.x,
            y0 = d3.event.y;

        d3.event.on("drag", function() {
            var x1 = d3.event.x,
                y1 = d3.event.y,
                dx = x1 - x0,
                dy = y1 - y0;

            if (dx * dx + dy * dy > 100) d.push([x0 = x1, y0 = y1]);
            else d[d.length - 1] = [x1, y1];
            active.attr("d", line);
        });
    }

    /*****************************EVENT*************************************/



    /*****************************Draw*************************************/
    // canvas 如果 想渲染多重颜色到节点上 使用
    // 1方法：绘制每个节点都会
    // context.beginPath 
    // context.fill() 效率非常低
    // 
    // canvas 在批量绘制节点是 打开绘画器，效率很高
    //  被标记的节点毕竟在少数，使用 1方法 非常有问题
    //  创建 源数据标记引用组，在全局绘画完成后 对单组数据进行绘画
    //  在修改源数据color时 将标记节点放入标记组 markGroup 
    //  注意: 打开详细信息时，需要全局重绘覆盖 markGroup 对应的 node和line 效率提高，减少render次数
    //  全局render使用 全局颜色: rColor,  消息路径绘制 使用全局颜色 mColor

    var markNodeGroup = [],
        markLinkGroup = [],
        filterNodeGroup = [],
        // 以获取到 label 节点分类,标记nodes中的isLabel关键字，无法通过关键字反推类型
        // 因此在render 中直接过滤掉isLabel关键字的所有点的绘制过程减少 重复绘制导致render函数绘制较慢的情况
        label_nodes = null;

    var labelColor = {
        gender: {
            f: '#F73080',
            m: '#93BFF5'
        },
        verify: {
            generalV: '#F73080',
            blueV: '#93BFF5',
            yellowV: '#cadc4f'
        },
        node: {
            main: 'black',
        }
    };
    // var mainNodesColor = "#2f2199", mainLinksColor = "#fe3184" 
    // var markNodesColor = "orange", markLinksColor = "pink"
    function render() {
        var time0 = Date.now(),
            time1;
        markNodeGroup = [];
        markLinkGroup = [];
        filterNodeGroup = [];

        context.save();
        context.clearRect(0, 0, width, height);
        context.beginPath();
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        llinks.forEach(function(link) {
            if (link.counter > 0) {
                markLinkGroup.push(link);
            } else {
                drawLink(link);
            }
        });
        // lineColor:"#2f2199",
        // context.strokeStyle = "#2f2199";
        context.strokeStyle = "#ccc";
        context.stroke();
        // -------bak--------//
        /*
            普通节点 标记节点 过滤节点 标注节点
            优先级： [标记节点(mark)] >  标注节点(label)] > [过滤节点(filter)  > 普通节点(general)
        */
        nodes.forEach(function(node, index) {
            if (node.counter > 0) {
                markNodeGroup.push(node);
            } else {
                if (node.isFilter) {
                    filterNodeGroup.push(node);
                } else {
                    drawNode(node, 0);
                }
            }
        });
        // nodesColor:"#fe3184",
        context.fillStyle = filterNodeGroup.length > 0 ? "#888" : "#fe3184";
        // context.fillStyle = "orange";
        context.fill();
        context.restore();

        // 标注模式与过滤模式：
        // 当过滤模式存在是，标注模式标记过滤点，当过滤模式没有用时，全局标注
        if (filterNodeGroup.length > 0) {
            context.save();
            context.beginPath();
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            context.stroke();
            //  Mark 点
            filterNodeGroup.forEach(function(node) {
                drawNode(node, 1);
            })
            context.fillStyle = "green";
            context.fill();
            // context.fill();
            context.restore();
        }

        if (label_nodes) {
            let color = labelColor[label_nodes.name];
            console.log('color ====>', color)
            for (let item in label_nodes) {
                if (item !== 'name') {
                    if (item === 'main') {
                        renderDrawNode(label_nodes[item], 1, color[item], 5 /*type main-node*/ );
                    } else {
                        renderDrawNode(label_nodes[item], 1, color[item]);
                    }
                }
            }
        }

        // context.fillStyle = "#fe3184";


        if (markLinkGroup.length > 0 || markNodeGroup.length > 0) {
            //  mark 线
            context.save();
            context.beginPath();
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            // context.lineWidth = 2
            markLinkGroup.forEach(function(link) {
                drawLink(link);
            })
            context.strokeStyle = "#433780";
            context.stroke();
            //  Mark 点
            markNodeGroup.forEach(function(node) {
                drawNode(node, 2);
            })
            context.fillStyle = "#433780";
            context.fill();
            // context.fill();
            context.restore();
            Object.values(oneUsername).forEach(function(node) {
                drawUsername(node);
            })
        }
        time1 = Date.now();
        if (openDialog)
            showDialog(lockNode)
    }

    function drawFps(fps) {
        context.save();
        context.font = "5 Microsoft YaHei";
        context.fillStyle = "orange";
        context.fillText("FPS: " + fps, width / 2, height / 10);
    }

    //  render 函数中使用
    function renderDrawNode(group, size, color, type) {
        console.log('renderDrawNode', color);
        context.save();
        context.beginPath();
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
        group.forEach((item) => {
            if (type === 5 || item.isFilter) {
                drawNode(item, size);
            } else if (filterNodeGroup.length === 0) {
                drawNode(item, size);
            }
        })
        context.fillStyle = color;
        context.fill();
        context.restore();
    }


    var oneUsername = {};

    function changeSrcLineColor(d, color) {
        var parentLineId, index
        if ((index = d.index) > 0) {
            llinks[index - 1].counter++;
            oneUsername[d.id] = d;
        }
        while ((parentLineId = d.parent)) {
            index = data_tree.nodes[parentLineId].index;
            d = nodes[index];
            if ((index = d.index) > 0) {
                llinks[index - 1].counter++;
            }
        }
    }

    function undoSrcLineColor(d, color) {
        var parentLineId, index
        if ((index = d.index) > 0) {
            --llinks[index - 1].counter
            delete oneUsername[d.id];
        }
        while ((parentLineId = d.parent)) {
            index = data_tree.nodes[parentLineId].index;
            d = nodes[index];
            if ((index = d.index) > 0) {
                --llinks[index - 1].counter
            }
        }
    }


    // counter 计数器用于 对一个node标记次数
    // 当counter = 0 时, 还原当前颜色
    // @mark 标记对颜色回复还是保留

    // markNodeGroup 引用
    // var markNodeGroup = [];
    function changeSrcNodeColor(d, color) {
        var parentNodeId, coord = zoomCoord(d);
        d.counter++
            d.isMark = true
            // 保存其实 node 坐标信息
        while ((parentNodeId = d.parent)) {
            index = data_tree.nodes[parentNodeId].index;
            d = nodes[index];
            d.counter++;
        }
    }

    function undoSrcNodeColor(d, color) {
        var parentNodeId, coord = zoomCoord(d);
        d.counter--;
        // 保存其实 node 坐标信息
        while ((parentNodeId = d.parent)) {
            index = data_tree.nodes[parentNodeId].index;
            d = nodes[index];
            d.counter--;
        }
    }


    function changeTemporaryLineColor(d, color) {
        var parentLineId, index
        if ((index = d.index) > 0) {
            drawtemporaryLink(llinks[index - 1], color)
        }
        while ((parentLineId = d.parent)) {
            index = data_tree.nodes[parentLineId].index;
            d = nodes[index];
            if ((index = d.index) > 0) {
                drawtemporaryLink(llinks[index - 1], color)
            }
        }
    }

    // 当标记某个点时，绘制用户名 
    function drawUsername(d) {
        context.save();
        context.font = "5 Microsoft YaHei";
        context.fillStyle = "black";
        context.fillText(d.username, transform.applyX(d.x - 5), transform.applyY(d.y - 4));
    }


    function drawLoop(dx, dy, d) {
        contextLoop.beginPath();
        contextLoop.strokeStyle = "blue";
        contextLoop.arc(dx, dy, /*r*transform.k+2*/ (d.circular_radius + 2.5) * transform.k, 0, 2 * Math.PI);
        contextLoop.lineWidth = 0.7;
        contextLoop.stroke();
        contextLoop.closePath()
    }

    function drawLink(d) {
        if (d.source && d.target) {
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
        }
        // context.strokeStyle =  d.lineColor;
    }

    function drawtemporaryLink(d, color) {
        if (d.source && d.target) {
            contextLoop.beginPath();
            // contextLoop.lineWidth = 0.6;
            contextLoop.moveTo(transform.applyX(d.source.x), transform.applyY(d.source.y));
            contextLoop.lineTo(transform.applyX(d.target.x), transform.applyY(d.target.y));
            contextLoop.strokeStyle = color;
            contextLoop.stroke()
        }
    }


    function drawNode(d, r) {
        context.moveTo(d.x, d.y);
        context.arc(d.x, d.y, /*keyword2Radius(d)*/ d.circular_radius + r, 0, 2 * Math.PI);
        // context.arc(d.x, d.y, d.circular_radius ? d.circular_radius : 1, 0, 2 * Math.PI);
    }


    //  mouseOn a Node 
    //  draw before:  mousemove trigger someLine->lineColor change to other color
    //  layer1: draw line 
    //  layer2: draw temp line
    //  layer2: draw nodes
    //  layer3: draw loop 

    //  mouseOut a Node 
    //   recover: lines->lineColor recovery

    var switchMouseColor = ['blue', '#2ca02c'];

    // on开关: 0 mouseon, 1 mouseout
    function mouseEventChian(d, on) {
        // changeTemporaryLineColor(d, switchMouseColor[on]);
        // render(changeTemporaryLineColor,2, d, switchMouseColor[on]);
        changeTemporaryLineColor(d, switchMouseColor[on])
        drawNodesChain(d, drawLoop, "blue");
    }

    // click a Node and its parent Node color, and link
    // click : trigger  Node color & link color 
    // before draw : one trigger, two change(node link)
    // layer 1: draw link
    // layer 2: draw node
    // layer 3: a  line to [window] 
    // layer 4: draw window and load text in this textarea

    // color switch to click event [node, link]
    var switchClickColor = {
        node: ["green", "blue"],
        link: ["orange", "#2ca02c"]
    }

    function clickEventChain(d) {
        console.log('clickEventChain');
        changeSrcLineColor(d, switchClickColor.link[0]);
        changeSrcNodeColor(d, switchClickColor.node[0]);
        render();
    }
    // click event:
    // 1 dom move to top&left
    // 2 begin a node draw  bezier to link domWindow
    // 3 display block
    // 如果node的位置位于 canvas 中心右边，dialogWindow 出现在左边
    // 初始化位置 
    var dialog = document.getElementById('dialog')
        //  	  ________________
        //	     /		   		 / 
        //	    /  .L           /
        // 	   /      .C       /
        //    /           .R  /
        //   /_______________/ 

    /*   贝塞尔曲线 链接的两点绝对的 (暂时不考虑 缩放平移的zoom)[x,y,dx,dy]
     *   dialogWindow的窗口相对于原有的点做平移 [dx,dy]基础上平移
     *   init 初始化 dialog 窗口
     *	 lockNode 记录数据:
     *  	条件: click 一个节点node window打开，保存记录 node 
     *            销毁node条件 window关闭
     */
    var lockNode = null;

    function showDialog(d) {
        //  -1 右边; 1 右边
        // lockNode = d;
        var dirction = d.x <= width / 4 ? 1 : -1; // hidpi 缩放canvas 为之前的2倍
        var dx, dy, r = d.circular_radius ? d.circular_radius : 2;
        if (d.wx && d.wy) {
            dy = d.wy;
            dx = d.wx;
        } else {
            dy = transform.applyY(d.y);
            dx = transform.applyX(d.x) + dirction * window_dx;
        }
        // transform时 window_dx不变
        dialog.style.top = dy - r * transform.k - dialog.clientHeight / 4 + 'px';
        dialog.style.left = dx - r * transform.k - dialog.clientWidth / 2 + 'px';
        bezierLine(d.x, d.y, dx, dy)
    }

    // 
    function bezierLine(x, y, dx, dy) {
        contextConsole.clearRect(0, 0, width, height);
        contextConsole.beginPath()
            // contextConsole.lineWidth = 0.6
        contextConsole.moveTo(transform.applyX(x), transform.applyY(y))
        contextConsole.quadraticCurveTo(transform.applyX(x), dy, dx, dy)
        contextConsole.strokeStyle = "red"
        contextConsole.stroke()
    }
    /*****************************Draw*************************************/


    /*****************************Document Object Model*************************************/
    // text:内容  username:用户名  followers_count:粉丝数  转发层级: 子节点个数childNode.length
    // comments_count: 评论数
    function initDialogData(d) {
        var username = getDom('username')
        username.innerHTML = d.username;
        username.href = "http://weibo.com/" + d.uid;
        var picture = getDom('picture')
        picture.src = d.user_avatar

        var text = getDom('content')
        text.innerHTML = '转发内容: ' + d.text;
        var relay = getDom('relay')
        relay.innerHTML = '直接转发: ' + d.children_count;
        var comments = getDom('comments')
        comments.innerHTML = '评论: ' + d.comments_count
        var fans = getDom('fans')
        fans.innerHTML = '粉丝: ' + d.followers_count
    }
    // click 1、lockNode 记录当前窗口状态, openDialog 允许窗口打开
    // 		 2、只初始化一次，修改关联节点颜色 并 增加counter计数器 [源数据操作]

    function getDom(id) {
        return document.getElementById(id);
    }


    function unmarkWindow() {
        if (openDialog && lockNode) {
            console.log('unmarkWindow')
            lockNode.isMark = false
            openDialog = false
            contextConsole.clearRect(0, 0, width, height)
            var date = new Date().getTime()
            undoSrcNodeColor(lockNode, colorSet.nodesColor)
            undoSrcLineColor(lockNode, colorSet.lineColor)
            closeWindow(dialog)
            render()
        }
    }

    function boundaryDetection(x, y, maxWidth, maxHeight) {
        if (x > maxWidth) {
            x = maxWidth - dialog.clientWidth * 3 / 2;
        }
        if (x < 0)
            x = dialog.clientWidth / 2;
        if (y > maxHeight) {
            y = maxHeight - dialog.clientHeight;
        }

        if (y < 0)
            y = dialog.clientHeight;
        return [x, y]
    }

    //  +---------------------------+
    //  +							+
    //  +	  dom    dom    dom     +
    //  +							+
    //  +---------------------------+

    function openWindow(dom) {
        dom.style.display = "block"
    }

    function closeWindow(dom) {
        dom.style.display = "none"
    }

    function drawNodesChain(d, callback, color) {
        var parentNodeId, coord = zoomCoord(d);
        callback(coord.bx, coord.by, d, color)
            // d.nodesColor = colorSet.clickNodesColor
            // 保存其实 node 坐标信息
        saveStatus('mousemoved', zoomCoord(d))
        while ((parentNodeId = d.parent)) {
            index = data_tree.nodes[parentNodeId].index;
            d = nodes[index];
            // d.nodesColor = colorSet.clickNodesColor
            coord = zoomCoord(d);
            callback(coord.bx, coord.by, d, color);
        }
    }
    /*
     *@params x y r  common color = [#xxxxxx]   
     *
     */

    function drawMessage(dom, d, moveX, moveY) {
        var moveX = (d.x) * transform.k + transform.x,
            moveY = (d.y) * transform.k + transform.y;

        //    if(d.x < transform.invertX(width / 4) )	
        //    	moveX = moveX - dom.clientWidth - 40;
        // console.log('clientWidth', dom, dom.clientWidth, d)
        dom.style.top = (moveY - 10) + "px";
        dom.style.left = (moveX + 20) + "px";

        var context = getDom('userComments');
        context.innerHTML = '转发内容: ' + d.text;
        var userId = getDom('userId');
        userId.innerHTML = '用户名称: ' + d.username;

        dom.style.display = "block";
    }
    // 需要事件触发
    function findNode(canvas) {
        var m = d3.mouse(canvas),
            dx = (m[0] - transform.x) / transform.k,
            dy = (m[1] - transform.y) / transform.k;
        return find(dx, dy, 4 / transform.k)
    }

    function find(x, y, radius) {
        var i = 0,
            n = nodes.length,
            dx,
            dy,
            d2,
            node,
            closest;

        if (radius == null) radius = Infinity;
        else radius *= radius;

        for (i = 0; i < n; ++i) {
            node = nodes[i];
            dx = x - node.x;
            dy = y - node.y;
            d2 = dx * dx + dy * dy;
            if (d2 < radius) closest = node, radius = d2;
        }

        return closest;
    }

    function zoomCoord(d) {
        var bx = (d.x) * transform.k + transform.x,
            by = (d.y) * transform.k + transform.y;
        return {
            bx: bx,
            by: by,
            node: d
        }
    }



    function clearStatus(eventType) {
        globalStatus[eventType] = null
        globalStatus.status[eventType] = false
    }
    //  +---------------------------+
    //  +							+
    //  +	       colorSet         +
    //  +							+
    //  +---------------------------+

    var colorSet = {
        nodesColor: "orange",
        // nodesColor:"rgba(255,172,14, 0.5)",
        lineColor: "#2ca02c",
        // lineColor:"rgba(44, 160, 44, 1)",
        // mousemovedNodesColor:"#1d68a4",
        mousemovedNodesColor: "yellow",
        mousemovedLineColor: "#C92F22",
        clickNodesColor: "black"
    }


    var Dragging = function(validateHandler) {
        var draggingObj = null; //dragging Dialog
        var diffX = 0;
        var diffY = 0;

        function mouseHandler(e) {
            switch (e.type) {
                case 'mousedown':
                    draggingObj = validateHandler(e); //验证是否为可点击移动区域
                    if (draggingObj != null) {
                        diffX = e.clientX - draggingObj.offsetLeft;
                        diffY = e.clientY - draggingObj.offsetTop;
                    }
                    break;

                case 'mousemove':
                    if (draggingObj) {
                        // console.log('mousemove',e.clientX-diffX, e.clientY-diffY)
                        var d = lockNode;
                        if (d) {
                            var boundaryCheck = boundaryDetection(
                                (e.clientX - diffX) + dialog.clientWidth / 2,
                                e.clientY - diffY, width, height);
                            // console.log(boundaryCheck[0], boundaryCheck[1])
                            draggingObj.style.left = (e.clientX - diffX) + dialog.clientWidth / 2 + 'px';
                            draggingObj.style.top = (e.clientY - diffY) + 'px';
                            // d.wx = e.clientX-diffX+dialog.clientWidth/2;
                            // d.wy = e.clientY-diffY;
                            d.wx = boundaryCheck[0]
                            d.wy = boundaryCheck[1]
                                // render()
                            showDialog(d)
                        }
                    }
                    break;

                case 'mouseup':
                    draggingObj = null;
                    diffX = 0;
                    diffY = 0;
                    break;
            }
        };

        return {
            enable: function() {
                document.addEventListener('mousedown', mouseHandler);
                document.addEventListener('mousemove', mouseHandler);
                document.addEventListener('mouseup', mouseHandler);
            },
            disable: function() {
                document.removeEventListener('mousedown', mouseHandler);
                document.removeEventListener('mousemove', mouseHandler);
                document.removeEventListener('mouseup', mouseHandler);
            }
        }
    }

    function getDraggingDialog(e) {
        var target = e.target;
        // console.log(target.tagName);
        if (target.tagName === 'svg' || target.tagName === 'rect') return;
        while (target && target.className.indexOf('dialog-content') == -1) {
            target = target.offsetParent;
        }
        if (target != null) {
            return target.offsetParent;
        } else {
            return null;
        }
    }
    /*****************************Document Object Model*************************************/


    /*****************************Drawing Board*************************************/

    function createDrawBoard() {

    }

    /*****************************Drawing Board*************************************/

    function depth(key) {
        var deep = 0;
        while (data_tree.nodes[key].parent) {
            if (key === data_tree.nodes[key].parent) {
                break;
            }
            deep++;
            key = data_tree.nodes[key].parent;
        }
        return deep;
    }

    function retweet_layer_distribution() {
        let layer = [];
        for (let i = 0; i < nodes.length; i++) {
            if (!layer[nodes[i].level]) {
                layer[nodes[i].level] = +1;
            } else {
                layer[nodes[i].level]++;
            }
        }
        return layer;
    }
    // 标注过滤数据 

    function label_filter(queue) {
        console.log('label_filter')
        if (queue) {
            if (queue.name == 'gender') {
                gender_queue.name = queue.name;
                queue = gender_queue;
            } else if (queue.name == 'verify') {
                verified_queue.name = queue.name;
                queue = verified_queue;
            } else if (queue.name == 'node') {
                queue = {
                    'main': main_list,
                    'name': queue.name
                }
            }
        }
        label_switch(label_nodes, false);
        label_switch(queue, true);
        label_nodes = queue;
        render();
    }

    function label_switch(queue, isLabel) {
        if (queue) {
            for (let item in queue) {
                // console.log(item, isLabel)
                if (item !== 'name') {
                    queue[item].forEach((d) => {
                        nodes[d.index].isLabel = isLabel;
                    })
                }
            }
        }
    }

    // 属性过滤数据
    var filterRecords = null;

    function attribute_filter(queue) {
        console.log('attribute_filter')
        let len = queue.length,
            lenp, filter_list = [],
            cond, limit;
        if (filterRecords && filterRecords.length > 0) {
            filterRecords.forEach((d) => {
                nodes[d.index].isFilter = false;
            })
        }
        let prepare = nodes,
            mark = [],
            deep, date;

        // console.log('attribute_filter', queue);
        if (queue.length > 0) {
            for (let i = 0; i < len; i++) {
                lenp = prepare.length;
                cond = queue[i];
                if (cond.keyword == 'followers_count') {
                    limit = cond.rate * cond.limit;
                    for (let j = 0; j < lenp; j++) {
                        if (prepare[j][cond.keyword] >= limit) {
                            mark.push(prepare[j]);
                        }
                    }
                    prepare = mark;
                    mark = [];
                } else if (cond.keyword == 'children') {
                    limit = Math.pow(2, cond.limit);
                    for (let j = 0; j < lenp; j++) {
                        if (prepare[j][cond.keyword] && prepare[j][cond.keyword].length >= limit) {
                            mark.push(prepare[j]);
                        }
                    }
                    prepare = mark;
                    mark = [];
                } else if (cond.keyword == 'deepth') {
                    limit = cond.limit;
                    for (let j = 0; j < lenp; j++) {
                        if (prepare[j].level >= limit) {
                            mark.push(prepare[j]);
                        }
                    }
                    prepare = mark;
                    mark = [];
                } else if (cond.keyword == 't') {
                    limit = [];
                    limit[0] = new Date(cond.value[0]).getTime();
                    limit[1] = new Date(cond.value[1]).getTime();
                    // console.log('this ....', limit[0], limit[1])
                    for (let j = 0; j < lenp; j++) {
                        date = new Date(prepare[j][cond.keyword]).getTime();
                        if (date >= limit[0] && date <= limit[1]) {
                            mark.push(prepare[j]);
                        }
                    }
                    prepare = mark;
                    mark = [];
                }
            }
            prepare.forEach((d) => {
                nodes[d.index].isFilter = true;
            });
            filterRecords = prepare;
        } else {
            filter_nodes = null;
        }
        render();
    }

    function rotate_clockwise() {
        let root = nodes[0]
            // root.x = transform.applyX(nodes[0].x);
            // root.y = transform.applyY(nodes[0].y);
        nodes.forEach(function(node, index) {
            if (index !== 0 && !isNaN(node.x) && !isNaN(node.y)) {
                // var dx = transform.applyX(node.x - root.x);
                // var dy = transform.applyY(node.y - root.y);
                var dx = node.x - root.x;
                var dy = node.y - root.y;
                console.log('rotate_clockwise', node.x, root.x, dx);
                // var dx = node.x;
                // var dy = node.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                var beta = Math.asin(dy / d);

                if (dx < 0 && dy > 0) {
                    beta = Math.PI - beta;
                } else if (dx < 0 && dy < 0) {
                    beta = Math.PI - beta;
                } else if (dx > 0 && dy < 0) {
                    beta += Math.PI * 2;
                }
                beta = beta % (2 * Math.PI);
                node.x = Math.sin(Math.PI * 2 - beta + Math.PI / 16) * d;
                node.y = Math.cos(Math.PI * 2 - beta + Math.PI / 16) * d;
            }
        })
        render();
    }

    function switch_layout(type) {
        console.log('switch_layout');
        switch (type) {
            case 'tree':
                layout_tree(data_tree);
                break;
            case 'radiate':
                layout_radiate(data_tree);
                break;
            case 'circular':
                layout_circular(data_tree);
                break;
            default:
                layout_circular(data_tree);
        }
        nodes = Object.values(data_tree.nodes);
        render();
    }
    // 导出图片
    var draw_graph_summary = function() {
        var backgournd = document.createElement("canvas");
        var context = backgournd.getContext("2d");
        var n = width;
        var o = height;
        backgournd.width = n;
        backgournd.height = o;
        context.fillStyle = 'white';
        context.fillRect(0, 0, n, o);
        context.drawImage(canvas.node(), 0, 0, width, height);
        context.drawImage(canvasL, 0, 0, width, height);
        context.drawImage(canvasC, 0, 0, width, height);
        // r.setTransform(view_scaling, 0, 0, view_scaling, 0, 0);
        return backgournd.toDataURL()
    };
    /*****************************Node Calculate*************************************/


    /*****************************Vue Calculate*************************************/
    // 定向转发
    function vue_orientation() {
        if (cf_total == -1) {
            return [0, 100];
        }
        let percent = (cf_size * 100 / cf_total) | 0;
        return [100 - percent, percent];
    }

    // 性别
    let gender_queue = null;

    function vue_gender() {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].gender == 'm') {
                gender_queue.m.push(nodes[i]);
            } else if (nodes[i].gender == 'f') {
                gender_queue.f.push(nodes[i]);
            }
        }
        let male = Math.round(gender_queue.m.length * 100 / cf_size);
        let female = Math.round(gender_queue.f.length * 100 / cf_size)
        return [male, female];
    }

    //认证
    let verified_queue = null;

    function vue_verify() {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].verified_type === -1) {
                verified_queue.generalV.push(nodes[i]);
            } else if (nodes[i].verified_type === 0) {
                verified_queue.yellowV.push(nodes[i]);
            } else if (nodes[i].verified_type >= 1 && nodes[i].verified_type <= 8) {
                verified_queue.blueV.push(nodes[i]);
            }
        }
        let generalV = Math.round(verified_queue.generalV.length * 100 / cf_size);
        let blueV = Math.round(verified_queue.blueV.length * 100 / cf_size);
        let yellowV = Math.round(verified_queue.yellowV.length * 100 / cf_size);
        return [generalV, blueV, yellowV];
    }

    // 层级分布
    function vue_deep() {
        let temp = [];
        let depth_arr = retweet_layer_distribution();
        temp[1] = Math.round((depth_arr[1] || 0) * 100 / cf_size);
        temp[2] = Math.round((depth_arr[2] || 0) * 100 / cf_size);
        temp[3] = Math.round((depth_arr[3] || 0) * 100 / cf_size);
        temp[4] = Math.round((depth_arr[4] || 0) * 100 / cf_size);
        temp[5] = Math.round((depth_arr[5] || 0) * 100 / cf_size);
        if (depth_arr.length - 1 > 6) {
            let layer6 = 100 - temp[1] - temp[2] - temp[3] - temp[4] - temp[5];
            return [
                temp[1],
                temp[2],
                temp[3],
                temp[4],
                temp[5],
                layer6
            ];
        } else {
            let sum = 0;
            for (let i = 1; i < depth_arr.length - 1; i++) {
                sum += temp[i];
            }
            temp[depth_arr.length - 1] = 100 - sum;
            return [
                temp[1] || 0,
                temp[2] || 0,
                temp[3] || 0,
                temp[4] || 0,
                temp[5] || 0,
                temp[6] || 0
            ];
        }
    }

    /*  先计算 主节点 
          选取规则:直接点转发节点 大于 size * 0.01
    
    */
    let main_list = null;

    function vue_account() {
        let account_count = -1;
        // for(let mid in mainNode){
        //     if(mainNode[mid].length > (size * 0.01) && srcData[mid]){
        //         main_list.push(srcData[mid]);
        //     }
        // }
        let user = {},
            uid;
        for (let i = 0; i < nodes.length; i++) {
            uid = nodes[i].uid
            if (!user[uid]) {
                user[uid] = {};
                user[uid].count = 1;
                user[uid].mid_list = [];
                user[uid].mid_list.push(nodes[i].mid);
            } else {
                user[uid].count++;
                user[uid].mid_list.push(nodes[i].mid);
            }

            if (nodes[i].children_count > cf_size * 0.01) {
                main_list.push(nodes[i]);
            }
        }
        console.log('main_list', main_list);
        // this.uid_list = user;
        account_count = Object.keys(user).length;
        return [account_count, main_list];
    }


    function vue_fans(filter_fans) {
        let bucket = _.fill(new Array(filter_fans.step), 0);
        nodes.forEach((d) => {
            let index = (d.followers_count / filter_fans.rate) | 0;
            if (index >= filter_fans.step) {
                index = filter_fans.step - 1;
            }
            bucket[index]++;
        })
        return bucket.join(',');
    }

    //  在现有的数据之上处理数据
    //  childTable 记录所有有转发数,A有n个child,就有n个转发数 (直接转发)
    //  log2(size) 让数据分布的更均匀
    let retweet;

    function vue_retweet(filter_retweet) {
        filter_retweet.step = Math.floor(Math.log2(cf_size));
        let retweet = _.fill(new Array(filter_retweet.step), 0);
        nodes.forEach((d) => {
            let index = Math.floor(Math.log2(d.children_count));
            if (index >= filter_retweet.step) {
                index = filter_retweet.step - 1;
            }
            retweet[index]++;
        })
        console.log('[bucket]', retweet);
        return retweet.join(',');
    }

    function vue_depth(filter_depth) {
        // this.filter_deepth.limit = -1;
        let = depth_arr = retweet_layer_distribution();
        filter_depth.step = depth_arr.length;
        console.log('depth', depth_arr);
        return depth_arr.join(',');
    }


    function vue_timeline(time_line, offset) {
        // 清除数据
        let base_time = new Date(nodes[0].t).getTime(), // 发布日期
            dist_time_list = [],
            dist_mid_list = [],
            index,
            limit = 3 * 24 * 60 * 60 / offset; // 计算3天内的数据 大于三天在 limit+1出的索引给出

        dist_time_list[0] = 1;
        dist_mid_list[0] = [nodes[0].mid];
        for (let i = 1; i < nodes.length; i++) {
            index = Math.floor((new Date(nodes[i].t).getTime() - base_time) / 1000 / offset);
            if (index > limit) {
                index = limit + 1;
            }
            if (!dist_time_list[index]) {
                dist_time_list[index] = 1;
                dist_mid_list[index] = [];
                dist_mid_list[index].push(nodes[i].mid);
            } else {
                dist_time_list[index]++;
                dist_mid_list[index].push(nodes[i].mid);
            }
        }
        dist_mid_list = dist_mid_list;

        for (let k = 0; k < dist_time_list.length; k++) {
            if (!dist_time_list[k]) {
                dist_time_list[k] = 0;
            }
        }
        //初始化 time_line
        time_line.step = dist_time_list.length;
        time_line.base_time = base_time;
        time_line.disabled = false;
        console.log('dist_time_list', dist_time_list.length)
        return dist_time_list.join(',');
    }
    /*****************************Vue Calculate*************************************/

    return {
        launch: launch,
        recover_param: recover_param,
        attribute_filter: attribute_filter,
        label_filter: label_filter,
        selfAdpter: selfAdpter,
        render: render,
        // rotate_clockwise: rotate_clockwise,
        switch_layout: switch_layout,
        draw_graph_summary: draw_graph_summary,
        vue_orientation: vue_orientation,
        vue_gender: vue_gender,
        vue_verify: vue_verify,
        vue_deep: vue_deep,
        vue_account: vue_account,
        vue_fans: vue_fans,
        vue_retweet: vue_retweet,
        vue_depth: vue_depth,
        vue_timeline: vue_timeline
    }
}