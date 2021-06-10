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
    var tmin = 1e100;
    var tmax = -1e100;
    var data_tree = {};
    data_tree.start = tmin;
    data_tree.end = tmax;
    data_tree.nodes = srcData;
    // srcData 释放引用
    srcData = null;
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
                friends_count: a.friends_count,
                comments_count: a.comments_count,
                reposts_count: a.reposts_count,
                statuses_count: a.statuses_count,
                attitudes_count: a.attitudes_count,
                username: a.username,
                followers_count: a.followers_count,
                verified_type: a.verified_type,
                gender: a.gender,
                p: a.parent,
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

function retweet_layer_distribution(nodes) {
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

module.exports = {
    createTree: init,
    retweet_layer_distribution: retweet_layer_distribution
}