// node color #fe3184
// line color #a8ddfd
// background color #fff
var nodes;
var llinks = [];
var childTable = {};
var srcData = {},
    root = null;
var check_reqeat_data = [],
    mergerQueue;
// default  node color orange  |  line Color green | background color  rgb(04,32,41) 
(function() {
    // var nodes;
    var mars = new Date().getTime()
    console.log('Send Message from Mars:', mars);

    d3.json('http://127.0.0.1:3000/batch?url=http://weibo.com/5875818210/Euz7azZ71', launch)
        // .timeout(1000*60*30)
        // .header("Content-Type","application/json")
        // .send("GET",launch);

    // d3.json('http://127.0.0.3000/batch?'+window.location.search)
    // //    .timeout(1000*60*30)
    //    .header("Content-Type","application/json")
    //    .send("GET",launch);


    var frequency = 30,
        current_position = 1,
        isCompleted;


    function request(url) {
        return new Promise((resolve, reject) => {
            d3.json('http://127.0.0.1:3000/piece').timeout(1000 * 60 * 30)
                .header("Content-Type", "application/json")
                .send("POST", JSON.stringify({ url: window.location.search.split('=')[1] }),
                    (err, data) => {
                        if (err) reject(err);
                        resolve(data)
                    });
        })
    }

    // function combine(arr,ret)
    // {
    // 	return new Promise((resolve, reject)=>{
    // 		arr.data.data = arr.data.data.concat(ret.data);
    // 		resolve(arr)
    // 	})
    // }

    //  获取数据头
    async function checkHeader() {
        let ret = await request();
        console.log(ret)
        mergerQueue = ret;
        current_position = 1;
        isCompleted = ret.status
    }

    async function request_queue_start(url) {
        await checkHeader()
        if (isCompleted === 1) {
            console.log('[mergerQueue]', mergerQueue)
            launch(mergerQueue)
        } else if (isCompleted === 0) {
            while (1) {
                let ret = await request()
                if (ret.status === 1) break;
            }
            let ret = await request();
            launch(ret);
        } else if (isCompleted === -1) {
            while (1) {
                let ret = await request()
                mergerQueue.data.data = mergerQueue.data.data.concat(ret.data)
                current_position++;
                if (current_position % frequency === 0) {
                    launch(mergerQueue)
                }
                isCompleted = ret.status
                if (isCompleted === 1) break;
            }
            launch(mergerQueue)
        }
    }

    // request_queue_start()

    function recover_param() {
        Rz = 80;
        m = 100;
        var zoomK = -1;
        R = 100;
        dr = 10;
        alpha = 8 * PI;
        subR = -1;
        subDr = -1;
        _100 = 0;
        _300 = 0;
        _500 = 0;
        _1000 = 0;
        _2000 = 0;
        _2001 = 0;
        tk = -1;
        descendantK = 1.5;
        lockNode = null;
        llinks = [];
        transform.k = 1 / 4;
        transform.x = 0;
        transform.y = 0;
        current_position = 1;
        context.clearRect(0, 0, width, height);
        contextLoop.clearRect(0, 0, width, height);
        contextPre.clearRect(0, 0, width, height);
        contextConsole.clearRect(0, 0, width, height);
    }

    function launch(ret) {
        recover_param()
        console.log(ret)
        var launch = new Date().getTime()
        console.log("launch===>", launch)
            // 测试
        initSrcData(ret.data.data, ret.data.fields)
        perprocess(ret.data.data.length)
        console.log('return size === src szie>', ret.data.data.length, Object.values(srcData).length)
            // pod(root, centerX/4, centerY/4, R, dr, 30*PI,0)
        test_layout(ret.data.data.length, root, 25, centerX / 4, centerY / 4)()
        nodes = Object.values(srcData).map(function(d, i) {
            return {
                index: i,
                id: d.id,
                counter: 0,
                isMark: false,
                x: d.x,
                y: d.y
            }
        })
        canvas
            .on("mousemove", mousemoved)
            .on("click", click)
            .call(d3.drag().subject(dragsubject).on("drag", dragged).on("end", ended))
            .call(d3.zoom().scaleExtent([1 / 32, 2]).on("zoom", zoomed))
            .call(initForce)
            .on("dblclick.zoom", null)
            .on("click.drag", null)
            .on("click.zoom", null);

        console.log('Catch Message from Earth ∆ ====> :', new Date().getTime() - mars)
        console.log('Catch Data Value ∆ ====> :', new Date().getTime() - launch);
    }
    /* ===============child数量很大的时候===================**/
    //  指定一个固定的Cricle radius R∆ 
    //  在 适配一个半径 为R，增速为 r0 每2π  
    //  size 为 节点容量， 假设 m为一圈(2π) 节点数量 m，一共有k圈
    //   R∆ = R  + (k - 1)*r0
    //   k*r0 = size / m
    //   r0 = size / (m * k)
    //   R = R∆ - (k-1)/(m * k) * size

    var Rz = 80,
        m = 100;

    function adpter(size) {
        console.log('adpter', size)
        if (size > 500) Rz = 50
        else if (size > 250 && size <= 500) Rz = 40
        else if (size > 100 && size <= 250) Rz = 30
        else if (size > 50 && size <= 100) Rz = 25
        else Rz = 20
        var k = ~~(size / m) + 1;
        subDr = 10;
        subR = Rz
    }


    // 需要考虑的选择 参数 （由节点群大小决定）
    //1) 子节点群与父节点的距离，计算父节点与子节点之间的距离 两个半径相加
    //2) 选择初始化 相对缩放 大小，符合nodes大小
    //3) 节点过大时，禁用zoom功能？
    //4) 对于局部节点重绘时，如何避开全局绘制
    // var descendantK = -1; // 子孙关系之间的半径K
    var zoomK = -1; // 初始缩放大小
    function perprocess(size) {
        // descendantK  = (size / 5000 - 1)* 0.5 + 2.0
        zoomK = 10000 / size > 1 ? 1 : 10000 / size;
    }

    var canvas = d3.select("#base"),
        context = canvas.node().getContext("2d"),
        width = canvas.property("width"),
        height = canvas.property("height"),
        radius = 8,
        transform = d3.zoomIdentity;

    var globalStatus = { status: { mousemoved: false }, lockId: null };

    function saveStatus(eventType, eventStatus) {
        if (!globalStatus[eventType]) globalStatus[eventType] = {}
        globalStatus[eventType] = eventStatus
        globalStatus.status[eventType] = true
    }

    // 分配nodes
    // beta 变换 初始位置
    var PI = Math.PI,
        sin = Math.sin,
        cos = Math.cos;

    function assignPosition(x0, y0, r0, dr, alpha, bate) {
        if (!bate) bate = 0;
        alpha = alpha + bate;
        var R = dr / PI * alpha + r0;
        var x1 = R * sin(-alpha + PI / 2) + x0; // 逆时针
        var y1 = y0 - R * cos(-alpha + PI / 2);
        return [x1, y1]
    }
    // var llinks = [];

    function link() {
        let l;
        for (l = 1; l < nodes.length; l++) {
            // if(nodes[srcData[srcData[nodes[l].id].parent].index])
            // console.log('link ', l, nodes[srcData[srcData[nodes[l].id].parent].index]);
            llinks.push({
                target: nodes[l],
                source: nodes[srcData[srcData[nodes[l].id].parent].index],
                counter: 0
            })
        }
    }
    // var srcData = {}, root = null;

    function initSrcData(data, fields) {
        var d, f,
            //  初始化数据 去除重复数据
            lenD = data.length,
            lenF = fields.length,
            obj, childQ = [];
        console.log('Length ====> ', lenD, lenF)
        for (d = 0; d < lenD; d++) {
            obj = new Object()

            if (data[d]) {
                for (f = 0; f < lenF; f++) {
                    obj[fields[f]] = data[d][f];
                }
            } else {
                continue;
            }
            // 存在重复数据的时候，把数据剔除，但是给对象赋值index 会造成不连续
            srcData[obj.id] = obj
        }
        var srcArr = Object.values(srcData),
            single;
        // 创建 childTable， 分配与nodes llinks 关联的index
        for (var ii = 0; ii < srcArr.length; ii++) {
            single = srcArr[ii]
            if (single.parent) {
                if (childTable[single.parent] == undefined) {
                    childTable[single.parent] = []
                    childTable[single.parent].push(single) // shit 
                } else {
                    childTable[single.parent].push(single)
                }
            }

            if (single.parent == null) {
                root = single
                root.children = []
            }
            single.index = ii;
        }

        // console.log('srcData', Object.values(srcData).length)
        // let counter = 0;
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
                    srcData[childTable[key][d].id].parent = root.id
                        // console.log('[Assign to root]', root, root.children, srcData[childTable[key][d].id])
                    root.children.push(srcData[childTable[key][d].id])
                }
            }
            // counter += childTable[key].length;
            // console.log('children Len:',childTable[key].length, counter)
        }
    }
    // root | layer1 | layer2 | layer3 .....
    // assignPosition(x0, y0, r0, dr, alpha, beta) 函数原型
    // var ccc = 0, fff=0;
    var centerX = width / 4,
        centerY = height / 4,
        _coord, R = 100,
        dr = 10,
        subR = 3,
        subDr = -1;

    function pod(node, x, y, R, dr, alpha) {
        if (node == root) {
            root.x = x
            root.y = y
        }
        // console.log(node.id, node.x, node.y)
        if (node.children) {
            for (let ii = 0, kk = 0; ii < node.children.length; ii++) {
                if (node.children[ii].children) {
                    // 对接 assginValue <====> adpterAlpha
                    deepCounter(node.children[ii]);
                    kk = assginValue(deepChildNum)
                        // 适配测试
                    adpter(deepChildNum)
                        // 
                        // console.log('beta ', beta)
                    _coord = assignPosition(x, y,
                            distanceR(node.children.length, node.children[ii].children, deepChildNum, alpha, dr, subR), subDr, (kk) / adpterAlpha(node.children[ii].children))
                        // console.log('deepChildNum', deepChildNum)
                        // deepCounter(node.children[ii]);
                        // console.log('counter size === >',node.children[ii], deepChildNum)
                    deepChildNum = 0;
                    node.children[ii].x = _coord[0]
                    node.children[ii].y = _coord[1]
                    pod(node.children[ii], _coord[0], _coord[1],
                        subR, subDr, 15 * PI,
                        // nextBeta(node.children[ii],node, (kk)/ adpterAlpha(node.children[ii].children))
                        0
                    )
                } else {
                    // if(srcData[node.children[ii].parent] === root){
                    _coord = assignPosition(x, y, R, dr, (ii) / alpha, 0)
                        // }else{
                        // _coord = assignPosition(x, y, 20, dr, (ii)/(15*PI), nextBeta(node.children[ii], 15*PI))	
                        // }			
                    node.children[ii].x = _coord[0]
                    node.children[ii].y = _coord[1]
                }
            }
        } else {
            return node
        }
        // }
    }
    // var sectorß = PI * 2 
    function adpterAlpha(childs) {
        var size = childs.length
        if (size > 0 && size < 5) {
            return 10 * PI;
        } else if (size >= 5 && size < 20) {
            return 8 * PI;
        } else if (size >= 20 && size < 50) {
            return 5 * PI;
        } else if (size >= 50 && size < 100) {
            return 3 * PI
        } else if (size >= 100 && size <= 300) {
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
    // 配合 adpterAlpha 调整不同 size 节点群大小的值
    // 当 size 在 a~b 范围,  adpterAlpha 提供对应的alpha值
    // assginValue 分配 在alpha值对用的 kk 值， kk与alpha 组合为一个 偏移角
    // @param 节点size
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
    // 用于: 统计 节点群 size 与 半径关系
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
    // 计算父子节点距离
    var tk = -1;
    var descendantK = 1.5

    function distanceR(size, child, deepChild, alpha, r0, R) {
        if (deepChild > 0 && deepChild <= 5) {
            tk = descendantK
        } else if (deepChild > 5 && deepChild <= 20) {
            tk = descendantK + 0.6
        } else if (deepChild > 20 && deepChild <= 50) {
            tk = descendantK + 0.9
        } else if (deepChild > 50 && deepChild <= 100) {
            tk = descendantK + 1.2
        } else if (deepChild >= 100 && deepChild <= 300) {
            tk = descendantK + 1.5
        } else if (deepChild > 300 && deepChild <= 1000) {
            tk = descendantK + 2
        } else if (deepChild > 1000 && deepChild <= 2000) {
            tk = descendantK + 3
        } else { // size > 2000
            tk = descendantK + 5
        }
        var r = (~~(size / (alpha * PI) + 10) * r0 + R) * tk
        tk = -1;
        var childR
        if (child) {
            childR = (~~child.length / (alpha * PI) * subDr + subR) * (Math.sqrt(child.length / 1000))
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
    var abs = Math.abs

    function nextBeta(children, k) {
        // var dx = x - node.x, dy =  y - node.y;
        var dx, dy;
        while (1) {
            if (root.children.includes(children)) {
                dx = children.x - centerX;
                dy = children.y - centerY;
                // dx = children.x - parent.x;
                // dy = children.y - parent.y;

                // console.log('llollo',children)
                break;
            } else {
                children = srcData[children.parent]
            }
        }
        // console.log(dx,dy)
        // var dx = children.x - centerX, dy =  children.y - centerY;  
        // var dpx = node.x - node.parent.x, dpy =  node.parent.y - node.y 
        // var alpha = node.children.length/27 * PI;
        // var beta =   Math.asin(dy/Math.sqrt(dx*dx+dy*dy)) %(2*PI);
        // console.log('nextBeta', dx, dy,beta, node.x, node.y)
        if (dx > 0 && dy > 0) {
            return k * 3 / 4 + Math.asin(abs(dx) / Math.sqrt(dx * dx + dy * dy)) / (2 * PI) * k;
        } else if (dx < 0 && dy > 0) {
            return k * 3 / 4 - Math.asin(abs(dx) / Math.sqrt(dx * dx + dy * dy)) / (2 * PI) * K;
        } else if (dx < 0 && dy < 0) {
            return k / 4 + Math.asin(abs(dx) / Math.sqrt(dx * dx + dy * dy)) / (2 * PI) * k;
        } else if (dx > 0 && dy < 0) {
            return k / 4 - Math.asin(abs(dx) / Math.sqrt(dx * dx + dy * dy)) / (2 * PI) * k;
        }

        // return Math.asin(dy/Math.sqrt(dx*dx+dy*dy)) %(2*PI);
    }

    function nextBeta(node) {
        return PI / 2
    }

    function initForce() {
        var date = new Date().getTime()
        console.log(transform)
        link()
        transform.k = zoomK
        transform.x = width / 4
        transform.y = height / 4

        render()
        Dragging(getDraggingDialog).enable();
        var _close = getDom('close')
        _close.addEventListener('click', unmarkWindow)
        console.log('time ====>', (new Date().getTime() - date) / 1000)
    }

    var canvasL = document.getElementById('loop');
    var contextLoop = canvasL.getContext('2d')
    var canvasPre = document.getElementById('precircle');
    var contextPre = canvasPre.getContext('2d')
    var message = document.getElementById('move_message')


    function dragged() {
        console.log('drag')
        closeWindow(this.nextElementSibling)
        contextLoop.clearRect(0, 0, width, height)
        var mouse = d3.mouse(this)
        drawPreCircle(mouse);
    }

    function ended() {
        var mouse = d3.mouse(this)
        var node = srcData[d3.event.subject.id]
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

    function recursiveChildren(mouse, node) {
        var child = node.children
        if (child) {
            var vectorX = transform.invertX(mouse[0]) - d3.event.subject.x;
            var vectorY = transform.invertY(mouse[1]) - d3.event.subject.y;
            for (var i = 0, len = child.length; i < len; i++) {
                nodes[child[i].index].x += vectorX;
                nodes[child[i].index].y += vectorY;
                recursiveChildren(mouse, child[i]);
            }
        } else {
            return root;
        }
    }
    // var stopX=-1, stopY=-1, stopK = -1;
    function zoomed() {
        console.log('zoomed')
            // closeWindow(message)
        transform = d3.event.transform;
        var start = new Date().getTime()
        render();
        console.log('zoomed render time ======> ', (new Date().getTime() - start) / 1000)
    }

    function dragsubject() {
        console.log('dragsubject')
        var d = findNode(this)
        if (d) return d;
    }
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
        markLinkGroup = [];
    // var mainNodesColor = "#2f2199", mainLinksColor = "#fe3184" 
    // var markNodesColor = "orange", markLinksColor = "pink"
    function render(isGlobel) {
        markNodeGroup = [];
        markLinkGroup = [];
        console.log("render");
        context.save();
        context.clearRect(0, 0, width, height);
        context.beginPath();
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);
        // globalDrawLinks()
        // globalDrawNodes()
        // llinks.forEach(drawLink);

        llinks.forEach(function(link) {
            if (link.counter > 0) {
                markLinkGroup.push(link);
            } else {
                drawLink(link);
            }
        });
        // lineColor:"#2f2199",
        context.strokeStyle = "#2f2199";
        // context.strokeStyle = "green";
        context.stroke();

        nodes.forEach(function(node, index) {
            if (node.counter > 0) {
                markNodeGroup.push(node);
            } else {
                drawNode(node, 3);
            }
        });
        // nodesColor:"#fe3184",
        context.fillStyle = "#fe3184";
        // context.fillStyle = "orange";
        context.fill();
        context.restore();
        if (markLinkGroup.length > 0 || markNodeGroup.length > 0) {
            //  mark 线
            context.save();
            context.beginPath();
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            context.lineWidth = 2
            markLinkGroup.forEach(function(link) {
                drawLink(link);
            })
            context.strokeStyle = "red";
            context.stroke();
            //  Mark 点
            markNodeGroup.forEach(function(node) {
                drawNode(node, 10);
            })
            context.fillStyle = "red";
            context.fill();
            // context.fill();
            context.restore();
        }
        if (openDialog)
            showDialog(lockNode)
    }

    function globalDrawNodes() {
        // context.clearRect(0,0,width,height)
        context.beginPath();
        // context.globalAlpha = 1
        nodes.forEach(drawNode);
    }

    function globalDrawLinks() {
        // context.clearRect(0,0,width,height)
        // context.globalAlpha = 0.5

        context.beginPath();
        context.lineWidth = 0.6;
        llinks.forEach(drawLink);
    }


    function changeSrcLineColor(d, color) {
        var parentLineId, index
        if ((index = srcData[d.id].index) > 0) {
            llinks[index - 1].counter++;
        }
        while ((parentLineId = srcData[d.id].parent)) {
            index = srcData[parentLineId].index;
            d = nodes[index];
            if ((index = srcData[d.id].index) > 0) {
                llinks[index - 1].counter++;
            }
        }
    }

    function undoSrcLineColor(d, color) {
        var parentLineId, index
        if ((index = srcData[d.id].index) > 0) {
            --llinks[index - 1].counter
        }
        while ((parentLineId = srcData[d.id].parent)) {
            index = srcData[parentLineId].index;
            d = nodes[index];
            if ((index = srcData[d.id].index) > 0) {
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
        while ((parentNodeId = srcData[d.id].parent)) {
            index = srcData[parentNodeId].index;
            d = nodes[index];
            d.counter++;
        }
    }

    function undoSrcNodeColor(d, color) {
        var parentNodeId, coord = zoomCoord(d);
        d.counter--;
        // 保存其实 node 坐标信息
        while ((parentNodeId = srcData[d.id].parent)) {
            index = srcData[parentNodeId].index;
            d = nodes[index];
            d.counter--;
        }
    }


    function changeTemporaryLineColor(d, color) {
        var parentLineId, index
        if ((index = srcData[d.id].index) > 0) {
            drawtemporaryLink(llinks[index - 1], color)
        }
        while ((parentLineId = srcData[d.id].parent)) {
            index = srcData[parentLineId].index;
            d = nodes[index];
            if ((index = srcData[d.id].index) > 0) {
                drawtemporaryLink(llinks[index - 1], color)
            }
        }
    }

    function drawUsername(d) {

    }


    function drawLoop(dx, dy, d) {
        // var r = keyword2Radius(d)
        contextLoop.beginPath();
        contextLoop.strokeStyle = "blue";
        contextLoop.arc(dx, dy, /*r*transform.k+2*/ 12 * transform.k, 0, 2 * Math.PI);
        contextLoop.lineWidth = 0.5;
        contextLoop.stroke();
        contextLoop.closePath()
    }

    function drawLink(d) {
        // if(d.source && d.target){
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
        // }
        // context.strokeStyle =  d.lineColor;
    }

    function drawtemporaryLink(d, color) {
        contextLoop.beginPath();
        contextLoop.lineWidth = 0.6;
        contextLoop.moveTo(transform.applyX(d.source.x), transform.applyY(d.source.y));
        contextLoop.lineTo(transform.applyX(d.target.x), transform.applyY(d.target.y));
        contextLoop.strokeStyle = color;
        contextLoop.stroke()
    }


    function drawNode(d, r) {
        context.moveTo(d.x, d.y);
        context.arc(d.x, d.y, /*keyword2Radius(d)*/ r, 0, 2 * Math.PI);
        // context.fillStyle = d.nodesColor;
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
        changeSrcLineColor(d, switchClickColor.link[0]);
        changeSrcNodeColor(d, switchClickColor.node[0]);
        render();

    }
    // click event:
    // 1 dom move to top&left
    // 2 begin a node draw  bezier to link domWindow
    // 3 display block
    var openDialog = false
    var window_dx = 250
    var canvasC = document.getElementById('console');
    contextConsole = canvasC.getContext("2d");
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
        var dx, dy, r = keyword2Radius(d);
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
        contextConsole.lineWidth = 0.6
        contextConsole.moveTo(transform.applyX(x), transform.applyY(y))
        contextConsole.quadraticCurveTo(transform.applyX(x), dy, dx, dy)
        contextConsole.strokeStyle = "red"
        contextConsole.stroke()
    }

    // text:内容  username:用户名  followers_count:粉丝数  转发层级: 子节点个数childNode.length
    // comments_count: 评论数
    function initDialogData(id) {
        var src = srcData[id]
        var username = getDom('username')
        username.innerHTML = src.username;

        var picture = getDom('picture')
        console.log('source ', src);
        picture.src = src.user_avatar

        var text = getDom('content')
        text.innerHTML = '转发内容: ' + src.text;
        var relay = getDom('relay')
        relay.innerHTML = '直接转发: ' + (src.children ? src.children.length : 0)
        var comments = getDom('comments')
        comments.innerHTML = '评论: ' + src.comments_count
        var fans = getDom('fans')
        fans.innerHTML = '粉丝: ' + src.followers_count
    }
    // click 1、lockNode 记录当前窗口状态, openDialog 允许窗口打开
    // 		 2、只初始化一次，修改关联节点颜色 并 增加counter计数器 [源数据操作]

    function getDom(id) {
        return document.getElementById(id);
    }

    function click() {
        console.log('click')
        var d = findNode(this)
        if (d) {
            lockNode = d;
            openDialog = true
            console.log('[Click===> childId, parentId]', d.id, d.parent)
                // init 
            initDialogData(d.id);
            openWindow(dialog)
            if (!d.isMark) {
                console.log('click======> first')
                clickEventChain(d)
            } else {
                console.log('then ............')
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

    function unmarkWindow() {
        if (openDialog && lockNode) {
            lockNode.isMark = false
            openDialog = false
            contextConsole.clearRect(0, 0, width, height)
            var date = new Date().getTime()
            undoSrcNodeColor(lockNode, colorSet.nodesColor)
            undoSrcLineColor(lockNode, colorSet.lineColor)
            closeWindow(dialog)
                // openDialog = false

            render()
            console.log(date - new Date().getTime())
                // contextConsole.clearRect(0,0,width,height)
        }
    }

    function boundaryDetection(x, y, maxWidth, maxHeight) {
        if (x > maxWidth) {
            x = maxWidth - dialog.clientWidth;
        }
        if (x < 0)
            x = dialog.clientWidth;
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
        while ((parentNodeId = srcData[d.id].parent)) {
            index = srcData[parentNodeId].index;
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
        dom.style.top = (moveY - 10) + "px"
        dom.style.left = (moveX + 20) + "px"

        var context = getDom('userComments')
        context.innerHTML = '转发内容: ' + srcData[d.id].text
        var userId = getDom('userId');
        userId.innerHTML = '用户名称: ' + srcData[d.id].username + ' id: ' + d.id

        dom.style.display = "block"
    }
    // 需要事件触发
    function findNode(canvas) {
        var m = d3.mouse(canvas),
            dx = (m[0] - transform.x) / transform.k,
            dy = (m[1] - transform.y) / transform.k;
        return find(dx, dy, 3 / transform.k)
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



    // 

    //  +---------------------------+
    //  +							+
    //  +	  获取缩放后的坐标        +
    //  +							+
    //  +---------------------------+

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
    //  +	  圆半径 有某个关键字确定  +
    //  +							+
    //  +---------------------------+

    function keyword2Radius(d) {
        var kObj = srcData[d.id]
            // return Math.log(kObj.followers_count*20)
        return 4
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
                                e.clientY - diffY, width / 2, height / 2);
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
        while (target && target.className.indexOf('dialog-content') == -1) {
            target = target.offsetParent;
        }
        if (target != null) {
            return target.offsetParent;
        } else {
            return null;
        }
    }

})()