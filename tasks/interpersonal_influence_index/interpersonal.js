/*
	@description: 数据单挑微博数据，后续需要合并数据
	@param  n=目标账号发布的一条微博下，互粉/粉丝账号贡献的（转+评+赞）数量
			N=目标账号发布的一条微博的（转+评+赞）总量
			ωi=∑(单条微博中）[n（转+评+赞）/N（转+评+赞）]
			ωi 依赖其他的数据集合
// ==========================账号自身影响力================================
/* 
   根据参数类型，接口数据及依赖 计算单独一条微博需要 与 n天数据的关系
   划分 global_property	单条 bar_property
   抽离自身账号影响， 需要把自身账号独立出 好友模块，粉丝模块，同样避免数据溢出
*/

import Task from '../../api/services/task'
import Request from '../../api/services/request'

const secret = require('../../config/weibo/secret.json')
const tree_util = require('../../lib/treex')
const weight = require('../config/influence_weight.json')
const fs = require('fs')
    // const sdk =  new weboSdk(secret.client_id, secret.secretApp, secret.redirect_uri);
    // const request = new Request(token)



async function friends_fans(root, request, N) {
    let friends = [],
        fans = [],
        relation, n, srcArr = root.children;
    for (let i = 0, len = srcArr.length; i < len; i++) {
        // relation = await request.get_relationship(root.uid, srcArr[i].uid)
        if (i % 2 === 1) {
            friends.push({
                uid: srcArr[i].uid,
                r: srcArr[i].reposts_count,
                c: srcArr[i].comments_count,
                z: srcArr[i].attitudes_count
            })
        } else if (i % 2 === 0) {
            fans.push({
                uid: srcArr[i].uid,
                r: srcArr[i].reposts_count,
                c: srcArr[i].comments_count,
                z: srcArr[i].attitudes_count
            })
        }
    }
    friends = distinct(friends)
    fans = distinct(fans)
    return {
        // mid: root.mid,
        friends: friends,
        fans: fans,
        N: N
    }
}

function distinct(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].uid === arr[j].uid) {
                arr[i].r += arr[j].r
                arr[i].c += arr[j].c
                    // arr[i].z += arr[j].z
                arr.splice(j, 1)
                    --j
            }
        }
    }
    return arr
}



function destoryRef() {
    srcData = {}
    childTable = {}
    root = null
}
/*
	@param uid 			用户id
		   start_time   起始时间
		   diff			距离的天数
		   pole			方向(start_time + diff * pole)
		   next			true 计算好友粉丝列表， false 只计算自身影响力
*/
// 根据uid 获取微博数据,并计算自身影响力
// @note 由于数据量比较大， 为了避免内存溢出， 没一条的数据只记录数据，完成后立即清除对象引用
async function self_data(uid, start_time, diff, pole, token, next) {
    // const token = await sdk.get_token()
    const request = new Request(token)
        // 获取微博列表
    let mid_list = null;
    // 没有获取任何列表信息
    if ((mid_list = await request.get_mid_list(uid, start_time, diff, pole)) === null) { //mid_list.length === page
        return 0;
    }
    console.log('mid_list', mid_list)
        // 参数
    let ret, r, l, c, z, bp,
        bar_properties = [],
        ff, ffs = [],
        task = new Task(),
        srcData = {},
        childTable = {},
        root = null;
    // 存在定向转发，真是微博列表数≤P 最后real_P 为真是可靠数据量  
    // fans量也是有变化的，所以取有效数据的平均fans量
    let P = mid_list.length,
        real_P = P,
        total_F = 0;
    for (let i = 0, len = P; i < len; i++) {
        task = new Task(mid_list[i], token, secret.client_id)
        ret = await task.get_data();
        console.log('i = [%s]', i, ret);
        if (ret !== 'data error') {
            let hasRoot = await tree_util.createTree(ret.data.data, ret.data.fields, srcData, childTable, root);
            console.log('[hasRoot]', hasRoot);
            if (hasRoot) {
                root = Object.values(srcData)[0];
                r = root.reposts_count;
                l = await tree_util.layer_max(srcData);
                c = root.comments_count;
                z = root.attitudes_count;
                total_F += root.followers_count;
                bp = new bar_property(r, l, c, z);
                bar_properties.push(bp);
                // 不是商业接口 访问接口受限制
                // 好友列表及粉丝列表
                if (next) {
                    let N = r + c + z;
                    // 只处理直接转发的影响力
                    ff = await friends_fans(root, request, N)
                    ffs.push(ff)
                }
                console.log('[bar_properties]', bar_properties);
                srcData = {};
                childTable = {};
                root = null;
                ret = null;
            } else {
                console.log('no root', ret)
                real_P--;
                continue;
            }
        }
    }
    console.log("[bar_properties]", bar_properties)
    let result = await calculate_self(bar_properties, real_P, total_F / real_P)
    if (next) {
        return {
            self: result,
            friends_fans_list: ffs
        }
    } else {
        return result
    }
}
// 分离用户微博列表原创文章后的 mid_list
// 功能，集成 用户自身影响力， 及用户关系树
// 问题: 如果获取的数据不是client_data, 为数据库原始数据，from_db_format_client省去无用的开销。
async function self_index_by_list(mid_list, tree, token, has_result) {
    // 存在定向转发，真是微博列表数≤P 最后real_P 为真是可靠数据量  
    // fans量也是有变化的，所以取有效数据的平均fans量
    let task, ret, self, srcData = {},
        childTable = {},
        root = null,
        bar_properties = [];
    let P = mid_list.length,
        real_P = P,
        total_F = 0;
    for (let i = 0, len = P; i < len; i++) {
        task = new Task(mid_list[i], token, secret.client_id)
        ret = await task.get_data();
        console.log('i = [%s]', i, ret);
        if (ret !== 'data error') {
            let hasRoot = await tree_util.createTree(ret.data.data, ret.data.fields, srcData, childTable, root);
            console.log('[hasRoot]', hasRoot);
            insert_relationship_tree(tree, Object.values(srcData))
            if (hasRoot && has_result) {
                root = Object.values(srcData)[0];
                r = root.reposts_count;
                l = await tree_util.layer_max(srcData);
                c = root.comments_count;
                z = root.attitudes_count;
                total_F += root.followers_count;
                bp = new bar_property(r, l, c, z);
                bar_properties.push(bp);
                // 不是商业接口 访问接口受限制
                // 好友列表及粉丝列表
                console.log('[bar_properties]', bar_properties);
                srcData = {};
                childTable = {};
                root = null;
                ret = null;
            }
        }
    }
    console.log("[bar_properties]", bar_properties)
    if (has_result) {
        self = await calculate_self(bar_properties, real_P, total_F / real_P)
        return {
            self_index: self,
            tree: tree
        }
    }

    return {
        tree: tree
    }
}


function insert_relationship_tree(tree, srcArr) {
    let node = null;
    for (let i = 1; i < srcArr.length; i++) {
        node = new Node(srcArr[i].uid, node_context_tostring(srcArr[i]))
        Tree.tree_insert(tree, node, 'retweet_count')
    }
    return tree;
}


function node_context_tostring(obj) {
    return {
        name: obj.username,
        text: obj.text
    }
}
/*

*/
async function friends_fans_data(friends_fans_list, start_time, diff, pole, token) {
    let len = friends_fans_list.length,
        a_weibo,
        friends, friend, fans, fan, N, n, self, uid;
    let friends_index = 0,
        fans_index = 0;
    for (let i = 0; i < len; i++) {
        console.log("Enter friends_fans_data");
        a_weibo = friends_fans_list[i];
        friends = a_weibo.friends;
        N = friends.N;
        console.log('a_weibo friend N', a_weibo, friend, N)
        for (let j = 0; j < friends.length; j++) {
            friend = friends[j];
            uid = friend.uid;
            n = friend.r + friend.c + friend.z;
            console.log('friend uid n', friend, uid, n)
            self = await self_data(uid, start_time, diff, pole, token);
            console.log('fffriends', self);
            friends_index += self * n / N
        }

        fans = a_weibo.fans;
        for (let m = 0; m < fans.length; m++) {
            fan = fans[m];
            uid = fan.uid;
            n = fan.r + fan.c + fan.z;
            self = await self_data(uid, start_time, diff, pole, token);
            console.log('fffans', self)
            fans_index += self * n / N
        }
    }
    console.log('index ---- index ', friends_index, fans_index)
    return [friends_index, fans_index]
}


async function calculate_self(self, P, F) {
    let len = self.length,
        result,
        total_r = 0,
        total_c = 0,
        total_z = 0,
        total_l = 0,
        max_r = 0,
        max_c = 0,
        max_z = 0,
        max_l = 0;
    for (let i = 0; i < len; i++) {
        total_r += self[i].r;
        total_c += self[i].c;
        total_z += self[i].z;
        total_l += self[i].l;
        if (max_r <= self[i].r) max_r = self[i].r;
        if (max_c <= self[i].c) max_c = self[i].c;
        if (max_z <= self[i].z) max_c = self[i].z;
        if (max_l <= self[i].l) max_c = self[i].l;
    }
    result = weight.self.w *
        (
            weight.self.exposure.w * (weight.self.exposure.wc * P + weight.self.exposure.fc * F) +
            weight.self.retweet.w * (weight.self.retweet.tr * total_r + weight.self.retweet.ar * total_r / P + weight.self.retweet.mr * max_r + weight.self.retweet.arl * total_l / P + weight.self.retweet.mrl * max_l) +
            weight.self.comment.w * (weight.self.comment.tc * total_c + weight.self.comment.ac * total_c / P + weight.self.comment.mc * max_c) +
            weight.self.favour.w * (weight.self.favour.tf * total_z + weight.self.favour.af * total_z / P + weight.self.favour.mf * max_z)
        );
    return result;
}


async function interpersonal_index(uid, start_time, diff, pole, token) {
    let self = await self_data(uid, start_time, diff, pole, token, true);
    console.log('[Self Self]', self)
    let ff_index = await friends_fans_data(self.friends_fans_list, start_time, diff, pole, token)
    let index = self.self + weight.friends.w * ff_index[0] + weight.fans.w * ff_index[1];
    console.log('[interpersonal_index]', index);
    return index;
}
// ===========================================================================


class Node {
    constructor(uid, context) {
        this.uid = uid;
        this.left = null;
        this.right = null;
        this.parent = null
        this.context = context;
        // 转发
        this.retweet_count = 1;
        this.by_retweet_count = 0;
    }
}

class Tree {
    constructor(root) {
        this.root = root;
    }


    static inorder_tree_walk(node, arr) {
        if (node !== null) {
            Tree.inorder_tree_walk(node.left, arr);
            console.log(node.uid);
            arr.push(node);
            Tree.inorder_tree_walk(node.right, arr)
        }
    }

    static preorder_tree_walk(node, arr) {
        if (node !== null) {
            console.log(node.uid);
            arr.push(node);
            Tree.inorder_tree_walk(node.left, arr);
            Tree.inorder_tree_walk(node.right, arr)
        }
    }

    static tree_search(node, uid) {
        if (node == null || uid === node.uid)
            return node;
        if (uid < node.uid)
            return Tree.tree_search(node.left, uid);
        else
            return Tree.tree_search(node.right, uid);
    }

    static iterative_tree_search(node, uid) {
        while (node != null && uid != node.uid) {
            if (uid < node.uid)
                node = node.left;
            else
                node = node.right;
        }
        return node;
    }

    static tree_minimum(node) {
        while (node.left != null) {
            node = node.left;
        }
        return node;
    }

    static tree_maximum(node) {
        while (node.right != null) {
            node = node.right;
        }
        return node;
    }

    static tree_successor(node) {
        if (node.right != null)
            return Tree.tree_minimum(node.right);
        let y = node.parent;
        while (y !== null && node === y.right) {
            node = y;
            y = y.parent;
        }
        return y;
    }

    static tree_insert(T, z, key) {
        let y = null;
        let x = T.root;
        while (x !== null) {
            y = x;
            if (z.uid < x.uid) {
                x = x.left;
            } else if (z.uid > x.uid) {
                x = x.right;
            } else if (z.uid === x.uid) {
                //关键字Exist 修改 转发 被转发关系 计数器
                //  被该用户转发的数据记录 用户root
                // if (key === 'by_retweet_count') {
                //     x.by_parent = T.root;
                // }
                if (key) {
                    x[key]++;
                    // console.log('[T.root]', T.root)
                    // x.by_parent = T.root;
                    return;
                }
                //不存在key 合并树
                // else {
                //     if (!x.link) {
                //         x.link = [];
                //     }
                //     console.log('[z.by_parent]', z.by_parent);
                //     x.link.push(z.by_parent.uid);
                // }
            }
        }
        z.parent = y;
        if (y == null) {
            T.root = z;
        } else if (z.uid < y.uid) {
            y.left = z;
        } else {
            y.right = z;
        }
    }

    static transplate(T, u, v) {
        if (u.parent == null)
            T.root = v;
        else if (u == u.parent.left)
            u.parent.left = v;
        else
            u.parent.right = v;
        if (v !== null)
            v.parent = u.parent
    }

    static tree_delete(T, z) {
        let y = null;
        if (z.left == null) {
            Tree.transplate(T, z, z.right);
        } else if (z.right == null) {
            Tree.transplate(T, z, z.left);
        } else {
            y = Tree.tree_minimum(z.right);
            if (y.p != z) {
                Tree.transplate(T, y, y.right);
                y.right = z.right;
                y.right.parent = y;
            }
            Tree.transplate(T, z, y);
            y.left = z.left;
            y.left.parent = y;
        }
    }
}

function readFile(fileName) {
    console.log('Inner Path', __dirname);
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

class Seed {
    constructor(uid) {
        this.uid = uid;
        this.name = '';
        // 种子账号的原创微博mid
        this.original_mid_list = [];
        // other_retweet_list 根据mid 划分
        /*
        	{
        		mid1: otherTree1,
        		mid2: otherTree2,
        		 .	      .
        		 .		  .
        		 .        .
        	}
        */
        // 转发微博列表
        this.other_retweet_list = [];
    }
}
// let accounts_list = [
//     1237064237, 1967114741, 2758916753,
//     1776287480, 3926680950, 1246227093,
//     1837389851, 2160639311, 1716705920,
//     1763405902, 1911018244, 1641492310,
//     5342666404, 5182526927, 5770976796,
//     1858846672, 2822867275, 1815695602,
//     1791549944, 1536259094, 1705491603,
//     1928653717, 1868369910, 1861276542,
//     1794454261, 5377290976, 1912992031,
//     2179677013, 1276021257, 1081555365
// ]
async function seed_result(start_time, diff, pole, token) {
    let seed, seeds = [];
    let accounts = await readFile('/Users/musix/Documents/codeflower/star.txt');
    let accounts_list = accounts.split('\n');
    console.log('[accounts_list]', accounts_list)
        // const token = await sdk.get_token()
    const request = new Request(token)
    let user_list = null;

    for (let i = 0; i < accounts_list.length; i++) {
        if ((user_list = await request.get_user_list(~~accounts_list[i], start_time, diff, pole)) !== null) { //mid_list.length === page
            seed = distinguish_users(~~accounts_list[i], user_list);
            console.log('Seed', seed)
            seeds.push(seed);
        }
    }
    return seeds;
}


function distinguish_users(uid, user_list) {
    let len = user_list.length;
    let seed = new Seed(uid);
    let is_attach = false;
    // 初始化名字
    // seed.name = user_list[0].user && user_list[0].user.name || user_list[0].user.screen_name;
    for (let i = 0; i < len; i++) {
        // 转发类型
        if (!is_attach && user_list[i].user) {
            seed.name = user_list[i].user.name || user_list[i].user.screen_name;
            is_attach = true;
        }
        if (user_list[i].retweeted_status) {
            // console.log('user_list[%s]', i, user_list[i]);
            // 转发文章没有删除
            if (user_list[i].retweeted_status.user && user_list[i].retweeted_status.user.id) {
                seed.other_retweet_list.push({
                    uid: user_list[i].retweeted_status.user.id,
                    mid: user_list[i].retweeted_status.mid,
                    name: user_list[i].retweeted_status.user.name || user_list[i].retweeted_status.user.screen_name,
                    text: user_list[i].retweeted_status.text
                });
            } else {
                console.log('转发文章已经删除');
            }
        }
        // 原创类型
        else {
            seed.original_mid_list.push(user_list[i].mid);
        }
    }
    // seed.other_retweet_list = distinct(seed.other_retweet_list);
    return seed;
}

// 拿到种子集合， 处理种子集合中原创微博
async function original_mid_result(start_time, diff, pole, token) {
    let seeds = await seed_result(start_time, diff, pole, token);
    let len = seeds.length,
        root, node, tree, result;
    for (let i = 0; i < len; i++) {
        root = new Node(seeds[i].uid, { name: seeds[i].name });
        tree = new Tree(root);
        /*暂时不需要 */
        // if (seeds[i].original_mid_list.length > 0) {
        //     // 原创微博 放入tree内
        //     result = await self_index_by_list(seeds[i].original_mid_list, tree, token);
        //     tree = result.tree;
        //     delete seeds[i].original_mid_list;
        // }
        // 转发微博放入 🌲内
        if (seeds[i].other_retweet_list.length > 0) {
            console.log('[seeds[%s]]', i, seeds[i]);
            for (let j = 0; j < seeds[i].other_retweet_list.length; j++) {
                console.log('[original_mid_result]', seeds[i].other_retweet_list[j].uid);
                node = new Node(seeds[i].other_retweet_list[j].uid, {
                    name: seeds[i].other_retweet_list[j].name,
                    text: seeds[i].other_retweet_list[j].text
                });
                node.retweet_count = 0;
                node.by_retweet_count = 1;
                Tree.tree_insert(tree, node, 'by_retweet_count'); // 被该用户转发内容
            }
            delete seeds[i].other_retweet_list;
        }
        seeds[i].tree = tree;
    }
    format_json(seeds);
    // let m_tree = merge_tree(seeds);
    // output_tree_file(m_tree);
    console.log(seeds[0]);
    console.log(seeds[0].tree.root);
    console.log('Done');
    return 'Done'
}

function merge_tree(seeds) {
    let v_root = new Node(-1, { 'message': '虚拟节点' }); // 虚拟root
    let m_tree = new Tree(v_root);
    let len = seeds.length;
    let m_arr = [], //merge 集合， 合并相同数据
        r_root = [], //真实root节点
        arr = [];
    //预处理 
    for (let i = 0; i < len; i++) {
        Tree.preorder_tree_walk(seeds[i].tree.root, arr);
        r_root.push(arr[0]);
        m_arr = m_arr.concat(arr);
    }
    len = m_arr.length;
    //归并到一棵树中
    for (let n = 0; n < len; n++) {
        Tree.tree_insert(m_tree, m_arr[n]);
    }
    return m_tree;
}

function output_tree_file(m_tree) {
    let arr = [],
        str = '';
    Tree.preorder_tree_walk(m_tree.root, arr);
    str += 'uid\t\t\tname\t\t\tretweet_count\t\t\tby_retweet_count' + '\n';
    for (let j = 0; j < arr.length; j++) {
        str += arr[j].uid + "\t\t" + arr[j].context.name + "\t\t" + arr[j].retweet_count + "\t\t" + arr[j].by_retweet_count + "\t\t" + arr[j].link.toString() + "\n";
    }
    fs.writeFile('./merge.txt', str, (err, data) => {
        if (err) throw err;
        console.log('Write File Done!!!')
    })
}

function format_file(seeds) {
    let len = seeds.length,
        arr = [],
        str = '';
    for (let i = 0; i < len; i++) {
        Tree.preorder_tree_walk(seeds[i].tree.root, arr);
        str += 'uid\t\t\tname\t\t\tretweet_count\t\t\tby_retweet_count' + '\n';
        for (let j = 0; j < arr.length; j++) {
            str += arr[j].uid + "\t\t" + arr[j].context.name + "\t\t" + arr[j].retweet_count + "\t\t" + arr[j].by_retweet_count + "\n"
        }
        // arr清空
        str += "\n\n\n";
        arr = [];
    }
    fs.writeFile('./assets/json/relation.txt', str, (err, data) => {
        if (err) throw err;
        console.log('Write File Done!!!')
    })
}

// line & node  类似蒲公英图的 json数据格式

function format_json(seeds) {
    let len = seeds.length,
        arr = [],
        json = { nodes: [], links: [] },
        node, link, root;
    for (let i = 0; i < len; i++) {
        Tree.preorder_tree_walk(seeds[i].tree.root, arr);
        // str += 'uid\t\t\tname\t\t\tretweet_count\t\t\tby_retweet_count' + '\n';
        root = arr[0];
        node = { id: root.uid, name: root.context.name };
        json.nodes.push(node)
        for (let j = 1; j < arr.length; j++) {
            // str += arr[j].uid + "\t\t" + arr[j].context.name + "\t\t" + arr[j].retweet_count + "\t\t" + arr[j].by_retweet_count + "\n"
            node = { id: arr[j].uid, name: arr[j].context.name };
            if (arr[j].by_retweet_count) {
                link = { target: root.uid, source: arr[j].uid };
            } else {
                link = { source: root.uid, target: arr[j].uid };
            }
            json.nodes.push(node)
            json.links.push(link)
        }
        // arr清空
        // str += "\n\n\n";
        arr = [];
    }
    fs.writeFile('./' + new Date().getTime() + '.json', JSON.stringify(json), (err, data) => {
        if (err) throw err;
        console.log('Write File Done!!!')
    })
}
module.exports = original_mid_result;