var PI = Math.PI,
    sin = Math.sin,
    cos = Math.cos,
    asin = Math.asin;
var tradition = function() {
    // beta 变换 初始位置
    var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos;

    function assignPosition(x0, y0, r0, dr, alpha, bate) {
        if (!bate) bate = 0;
        alpha = alpha + bate;
        var R = dr / PI * alpha + r0;
        var x1 = R * sin(alpha) + x0;
        var y1 = y0 - R * cos(alpha);
        return [x1, y1]
    }



    var centerX = width / 4,
        centerY = height / 4,
        _coord, R = 100,
        dr = 10,
        alpha = 8 * PI,
        subR = -1,
        subDr = -1;

    function pod(node, x, y, R, dr, alpha, beta) {
        if (node == root) {
            root.x = x
            root.y = y
        }
        // console.log(node.id, node.x, node.y)
        if (node.children) {
            for (let ii = 0, kk = 0; ii < node.children.length; ii++) {
                // ccc++;
                // console.log(ccc)
                _coord = assignPosition(x, y, R, dr, (ii) / alpha, beta)
                    // console.log(ii)

                if (node.children[ii].children) {
                    // 对接 assginValue <====> adpterAlpha
                    deepCounter(node.children[ii]);
                    kk = assginValue(deepChildNum)
                        // 适配测试
                    adpter(deepChildNum)
                        // 
                    _coord = assignPosition(x, y,
                        distanceR(node.children.length, node.children[ii].children, deepChildNum, alpha, dr, subR), subDr, (kk) / adpterAlpha(node.children[ii].children), beta)

                    // deepCounter(node.children[ii]);
                    // console.log('counter size === >',node.children[ii], deepChildNum)
                    deepChildNum = 0;
                    node.children[ii].x = _coord[0]
                    node.children[ii].y = _coord[1]
                    pod(node.children[ii], _coord[0], _coord[1],
                        subR, subDr, PI,
                        nextBeta(_coord[0], _coord[1])
                        // 0
                    )
                } else {
                    node.children[ii].x = _coord[0]
                    node.children[ii].y = _coord[1]
                }
            }
        } else {
            return node
        }
        // }
    }


    function adpterAlpha(childs) {
        var size = childs.length
            // if(size > 0 && size< 100){
            // 	return PI * 3 / 2
            // }else 
        if (size >= 0 && size <= 300) {
            return PI * 3 / 4
        } else if (size > 300 && size <= 500) {
            return PI * 3 / 8
        } else if (size > 500 && size <= 1000) {
            return PI * 3 / 16
        } else if (size > 1000 && size <= 2000) {
            return PI * 3 / 32
        } else { // size > 2000
            return PI * 3 / 64
        }
        // return temp 
    }

    var _100 = 0,
        _300 = 0,
        _500 = 0,
        _1000 = 0,
        _2000 = 0,
        _2001 = 0;

    function assginValue(size) {
        var temp = -1;
        // if( size > 1 && size <=100){
        // 	temp = _100
        // 	_100++
        // }else 
        if (size >= 0 && size <= 300) {
            temp = _300
            _300++
        } else if (size > 300 && size <= 500) {
            temp = _500
            _500++
        } else if (size > 500 && size <= 1000) {
            temp = _1000
            _1000++
        } else if (size > 1000 && size <= 2000) {
            temp = _2000
            _2000++
        } else { // size > 2000
            temp = _2001
            _2001++
        }
        return temp
    }


    var deepChildNum = 0;

    function deepCounter(root) {
        var child = root.children
        if (child) {
            for (var i = 0, len = child.length; i < len; i++) {
                deepChildNum++;
                deepCounter(child[i]);
            }
        } else {
            return root;
        }
    }
    var tk = -1;
    var descendantK = 3

    function distanceR(size, child, deepChild, alpha, r0, R) {
        // if( deepChild > 0 && deepChild <= 100){
        // 	tk = deepChild * 0.5
        // }else 
        if (deepChild >= 0 && deepChild <= 300) {
            tk = descendantK
        } else if (deepChild > 300 && deepChild <= 1000) {
            tk = descendantK + 2
        } else if (deepChild > 1000 && deepChild <= 2000) {
            tk = descendantK + 3
        } else { // size > 2000
            tk = descendantK + 5
        }
        // console.log("tk ==== >", tk)
        var r = (~~(size / (alpha * PI)) * r0 + R) * tk
        tk = -1;
        var childR
        if (child) {
            childR = (~~child.length / (alpha * PI) * subDr + subR) * (Math.sqrt(child.length / 1200))
                // console.log('child legth =======>', child.length);
        } else
            childR = 0
            // console.log('distance ∆',r, childR)
        return r + childR;
    }
    //  1、浏览器坐标y轴方向向上为-,向下为+,将y轴变为正常坐标轴
    //  2、将y轴变为正常坐标轴，取象限
    //  3、盘旋圆 以y轴为其实 有偏差
    //
    function nextBeta(x, y) {
        var dx = x - centerX,
            dy = centerY - y;
        var beta = Math.atan(dy / dx);
        if (dx > 0 && dy > 0) {
            return PI / 2 - beta
        } else if (dx < 0 && dy > 0) {
            return 3 * PI / 2 - beta
        } else if (dx < 0 && dy < 0) {
            return 3 * PI / 2 - beta
        } else if (dx > 0 && dy < 0) {
            return PI / 2 - beta
        }
    }
    return pod;
}


var n_tree = function(dc /*diameter_circle*/ , dd /*delta_distance*/ , rx, ry, rr) {
    //每个点基本直径
    var diameter_circle = dc;
    // parent 与子节点的距离 between_distance
    var between_distance;
    // 点与点之间的∆distance距离
    var delta_distance = dd;
    // 转发层级的
    /*
    	root(x,y)
    	count = part_mass(node)
    	horizontal_distance = d*count+∆d*(count-1)
    	node->x = root->x - horizontal_distance/2
    	node->y = y+between_distance
    */
    // 分配坐标
    function allocation(ii, node) {
        var count = part_mass(node)
        var delta_ii = ii - (~~(count / 2))
        var horizontal_distance =
            diameter_circle * delta_ii + delta_distance * (delta_ii)
        var cx = node.x + horizontal_distance
        var cy = node.y + distance(count)
        return [cx, cy]
    }

    var _coord;

    function n_tree_layout(node) {
        if (node === rr) {
            node.x = rx;
            node.y = ry;
        }
        if (node.children) {
            for (let ii = 0, kk = 0; ii < node.children.length; ii++) {
                _coord = allocation(ii, node);
                node.children[ii].x = _coord[0];
                node.children[ii].y = _coord[1];
                if (node.children[ii].children) {
                    n_tree_layout(node.children[ii]);
                }
            }
        } else {
            return node
        }

    }

    function distance(count) {
        return Math.pow(count, 1 / 2) * 10 + 70
    }

    function degree() {

    }

    function rotation(x, y) {

    }

    // 当前层级下的数据体量
    function part_mass(node) {
        return node.children.length
    }
    // 遍历后全部数据的体量
    var nodeCount = 0;

    function total_mass(node) {
        var child = node.children
        if (child) {
            for (var i = 0, len = child.length; i < len; i++) {
                nodeCount++;
                deepCounter(child[i]);
            }
        } else {
            return nodeCount;
        }
    }
    return n_tree_layout
}

/*
	1、绘制图的方式
	2、正确的方向
	3、节点群之间的距离
	4、如何正确的防止碰撞问题
	5、如何均匀分布
	6、
*/



var no_conflict_level_assignment = function(centerX, centerY, root, childTable, srcData) {

    // var centerX, centerY, root, childTable, srcData;

    // 把不同深度的数据拿出来
    // 
    function layout_depth_max_depth(childTable) {
        var depth;
        for (var key in childTable) {
            depth = node_depth(key);
            if (!layout_arr[depth]) {
                layout_arr[depth] = []
            }
            layout_arr[depth].push(childTable[key])
        }
    }

    function node_depth(key) {
        var depth = 0;
        while (srcData[key].parent) {
            depth++
            key = srcData[key].parent;
        }
        return depth;
    }

    // 节点 骨架
    function nodes_skeletion() {

    }
    // 节点之间的关系
    // root 源节点
    function relation_skeletion() {

    }
    // 从上到下依赖关系  root 必须分配节点，  接下来二级节点(依赖root 的坐标位置) 同理递归 
    // depth 下标为0 是表示
    function retweet_table() {
        var retweet_node_relation = [],
            depth;
        for (var item in childTable) {
            depth = node_depth(item);
            if (!retweet_node_relation[depth])
                retweet_node_relation[depth] = []
            retweet_node_relation[depth].push(item)
        }
        return retweet_node_relation;
    }
    // 从第1层转发 ， 获取叶子🍃节点数据，用于distance和offset_degree的计算 
    function node_weight(node) {
        var weight = 0;
        for (var n = 0, len = node.children.length; n < len; n++) {
            if (isLeaf(node.children[n])) {
                ++weight;
            }
        }
        return weight;
    }


    function assignPosition(x0, y0, r0, dr, k, n, offset) {
        // console.log('assignPosition', n)
        if (!offset) offset = 0;
        var degree = k * PI
        n = n + offset;
        var offset_degree = n / degree
        var R = dr / (PI * degree) * n + r0;
        var x1 = R * sin(offset_degree) + x0;
        var y1 = y0 - R * cos(offset_degree);
        return [x1, y1]
    }

    // [Function]offset_degree
    // [Param] dr 增长外径 | increament_k 每周长固定点个数 | R 内半径 | wieght 权重 | µ 偏移角 | ∆µ 允许误差角
    // ßR = dr/increament_k * weight + R
    // µ = asin(R/ßR)
    // offset_n = (µ+∆µ)/(2*2*PI)

    function offset_degree(dr, R, k, weight, delta) {
        var _R = dr / k * weight + R
        var beta = asin(R / _R)
        var offset_n = (beta + delta) / (2 * 2 * PI);
        return offset_n;
    }

    var weight, pnode_weight, cnode, pnode, dr = 50,
        R = 400,
        k = 8,
        delta = 10 / k * PI * PI;
    var offset_n, offset_main, arrc, arrp, distance, isStore = false,
        store_n = 0,
        _coord;

    function start_node() {
        var table = retweet_table();
        console.log('[Table] ==>', table)
            // root
        srcData[table[0][0]].x = centerX;
        srcData[table[0][0]].y = centerY;
        for (var depth = 0, lend = table.length; depth < lend - 1; depth++) {
            for (var num = 0, lenc = table[depth].length; num < lenc; num++) {

                pnode = srcData[table[depth][num]];

                for (var i = 0, len = table[depth + 1].length; i < len; i++) {
                    cnode = srcData[table[depth + 1][i]];
                    // console.log('depth i cnode', depth+1, i, cnode)
                    if (pnode.mid === cnode.parent) {
                        weight = node_weight(cnode);
                        arrc = adpter_radius(weight)
                        pnode_weight = node_weight(pnode);
                        arrp = adpter_radius(pnode_weight);
                        distance = node_distance(weight, pnode_weight, arrp[0], arrp[1], k, arrc[0], arrc[1]);
                        offset_n = offset_degree(arrp[0], arrp[1], k, weight, delta);
                        console.log('[offset_n]', offset_n)
                            // offset_main = (pnode === root ? 0 : extend_degree(pnode, k*PI*PI))
                            // console.log('[offset_main]', offset_main)
                        _coord = assignPosition(pnode.x, pnode.y, distance, arrc[0], 30, i, 0);
                        cnode.x = _coord[0];
                        cnode.y = _coord[1];

                        store_n += offset_n;

                    }
                }
                store_n = 0;
            }
        }
        var n_degree;
        for (var key in childTable) {
            for (var m = 0, lenf = childTable[key].length; m < lenf; m++) {
                if (isLeaf(childTable[key][m])) {
                    pnode = srcData[key];
                    n_degree = pnode !== root ? extend_degree(pnode, 8) : 0;
                    _coord = assignPosition(pnode.x, pnode.y, 100, 10, 16, m, n_degree)

                    childTable[key][m].x = _coord[0]
                    childTable[key][m].y = _coord[1]
                }
            }
        }

    }

    function extend_degree(pnode, k) {
        var dx = pnode.x - srcData[pnode.parent].x
        var dy = pnode.y - srcData[pnode.parent].y
        var beta = asin(Math.abs(dx) / Math.sqrt(dx * dx + dy * dy));
        if (dx > 0 && dy > 0) {
            return k / (beta + PI)
        } else if (dx < 0 && dy > 0) {
            return k / (PI - beta)
        } else if (dx < 0 && dy < 0) {
            return k / beta
        } else if (dx > 0 && dy < 0) {
            return k / (PI + PI - beta)
        }
    }


    function adpter_radius(size) {
        var Rz = 80,
            m = 100;
        if (size > 500) Rz = 80
        else if (size > 250 && size <= 500) Rz = 70
        else if (size > 100 && size <= 250) Rz = 60
        else if (size > 50 && size <= 100) Rz = 50
        else Rz = 40
        var k = ~~(size / m) + 1;
        subDr = size / (m * k);
        subR = Rz
        return [subDr, subR]
    }

    var tk = -1;
    var descendantK = 2

    function node_distance(node_weight, pnode_weight, r0, R, k, subDr, subR) {
        if (node_weight > 0 && node_weight <= 5) {
            tk = descendantK
        } else if (node_weight > 5 && node_weight <= 20) {
            tk = descendantK + 0.6
        } else if (node_weight > 20 && node_weight <= 50) {
            tk = descendantK + 0.9
        } else if (node_weight > 50 && node_weight <= 100) {
            tk = descendantK + 1.2
        } else if (node_weight > 100 && node_weight <= 300) {
            tk = descendantK + 1.5
        } else if (node_weight > 300 && node_weight <= 1000) {
            tk = descendantK + 2
        } else if (node_weight > 1000 && node_weight <= 2000) {
            tk = descendantK + 3
        } else { // size > 2000
            tk = descendantK + 5
        }
        // r0外径,R 内径
        var r = (~~(pnode_weight / (k * PI)) * r0 + R) * tk
        tk = -1;
        var childR = (~~node_weight.length / (k) * subDr + subR) * (Math.sqrt(node_weight / 1000))
        return r + childR;

    }


    function isLeaf(node) {
        return !node.children
    }

    return start_node
}



var test_layout = function(size, root, r0, centerX, centerY) {
    var period_layout = []

    function generate(node) {
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                if (node.children[i].children) {
                    period_layout.push(node.children[i])
                    generate(node.children[i])
                } else {
                    period_layout.push(node.children[i])
                }
            }
        }
    }

    function depth(key) {
        var depth = 0;
        while (srcData[key].parent) {
            depth++
            key = srcData[key].parent;
        }
        return depth;
    }


    // generate(root)
    // period_layout.map((d)=>{
    // 	return depth(d.id)
    // })

    function assignPosition(R, n, size) {
        // console.log('assignPosition', n)
        var degree = 2 * PI / size
        var x1 = R * sin(degree * n) + centerX;
        var y1 = centerY - R * cos(degree * n);
        return [x1, y1]
    }
    // 半径
    // 一个周长的比例
    // ß = 2 * asin(r0/R0)  2*PI/ß = size
    // R0 = r0/sin(PI/size)
    function adapter(size, r0) {
        return r0 / sin(PI / (size * 4 / 3))
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
            if (deep === depth(period_layout[m].mid)) {
                // console.log('[cursor&m]', cursor, m, cursor-m,~~((cursor+m)/2))
                return ~~((cursor + m) / 2)
            }
        }
        return (cursor + limit) / 2;
    }

    var _coord, R, deep, Rc, center_i;

    function coordinate() {
        root.x = centerX
        root.y = centerY
        generate(root)
        R = adapter(size, r0) / 25;
        // Rc = (Math.pow(5,1/2)-1)/2*R
        Rc = .2 * R
        for (var i = 0, len = period_layout.length - 1; i < len; i++) {
            deep = depth(period_layout[i].mid)
            center_i = align_center(i, deep)
                // if(deep === 1)
                // 	console.log('[deep, m, limit]',deep,i, center_i)
            _coord = assignPosition(R + (deep - 1) * Rc, center_i, size)
            period_layout[i].x = _coord[0]
            period_layout[i].y = _coord[1]
        }
    }


    function isLeaf(node) {
        return !node.children
    }

    return coordinate
}