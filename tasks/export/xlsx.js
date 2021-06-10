import {
    SingleSheet
} from 'objxlsx'
import {
    sum
} from 'lodash'
import {
    exist
} from '../../models/common'
import Weibos from '../../models/weibos'
import {
    weboSdk
} from '../../queue/auth/weibo_sdk'
import {
    config
} from '../../_base'
import * as mongoose from 'mongoose'
import Task from "../../queue/crawler/task"
const parseWeiboURL = require('../../lib/url_mid')
const tree_util = require('../../lib/treex')


export default class Xlsx {
    constructor(database, source_path, dist_path) {
        // this.sdk = new weboSdk(secret.client_id, secret.secretApp, secret.redirect_uri)
        this.mid_queue = []
        this.database = database
        // this.source_path = source_path
        this.dist_path = dist_path
        this.source_list = source_path ? SingleSheet.parse(source_path) : "" //xlsx 实例
        this.token = null
    }

    async task_id() {
        let mid;
        console.log('source_list', this.source_list)
        let i = 1;
        for (let s of this.source_list) {
            if (!s['链接']) {
                continue
            }
            mid = parseWeiboURL(s['链接'].trim())['mid']
            console.log('mid ====> ', mid, ++i);
            this.mid_queue.push(mid)
        }
    }

    async one_job(mid) {
        // if (!this.token) {
        //     this.token = await this.sdk.get_token()
        // }
        console.log('mid===>', mid);
        let result = await exist(mid);
        if (result.operate_code === 3) {
            let client_data = await Weibos.get(mid);
            console.log("Client_data", client_data);
            if (client_data === undefined || client_data == 'data error') {
                return []; // 数据出错 不做任何操作
            } else {
                let data_proportion = client_data.data.data.length + '/' + client_data.total_number;
                let tree_data = tree_util.createTree(client_data.data.data, client_data.data.fields)
                let layer = tree_util.retweet_layer_distribution(Object.values(tree_data.nodes));
                console.log("layer ==>", layer);
                console.log("tree_data ====>>", Object.values(tree_data.nodes).length);
                let data_store = await Promise.all(Object.values(tree_data.nodes).map(async(x, index) => {
                    return {
                        id: x.uid,
                        '微博名': x.username,
                        '微博': x.text,
                        '性别': x.gender,
                        '关注数': x.friends_count,
                        '粉丝数': x.followers_count,
                        '微博数': x.statuses_count,
                        '点赞数': x.attitudes_count,
                        '直接转发数': x.children ? x.children.length : 0,
                        '所在层级': x.level,
                        '认证等级': x.verified_type,
                        '真实用户比例': index === 0 ? data_proportion : "",
                        '转发层': index === 0 ? layer.toString() : ""
                    }
                }))
                console.log("tree_data ====>>", Object.values(tree_data.nodes).length);
                console.log("data_store", data_store);
                if (data_store.length > 0) {
                    return data_store;
                }
            }
        } else {
            return null;
        }
    }

    async one_job_buffer(mid) {
        let result = await this.one_job(mid)
        return SingleSheet.to_xlsx_buffer(result);
    }

    async execute(mid, number) {
        // if (!this.token) {
        //     this.token = await this.sdk.get_token()
        // }

        let task = new Task(mid, '2.00tUPeHGnDPE4Dd4b90b40ef044cQQ', secret.client_id)
        let client_data = await task.duplex_data();
        if (client_data == 'data error') {
            return; // 数据出错 不做任何操作
        } else {
            // console.log('[client_data]', client_data)
            // let data_proportion = client_data.data.data.length + '/' + client_data.total_number;
            // let srcData = {},
            //     childTable = {},
            //     root;
            // let src_retweet = await tree_util.createTree(client_data.data.data, client_data.data.fields, srcData, childTable, root)
            // let layer;
            // if (src_retweet) {
            //     layer = await tree_util.retweet_layer_distribution(srcData)
            // } else {
            //     layer = client_data.data.data.length - 1 + ' 非源级转发 没有找到root'
            // }
            // console.log('asdasdas', layer)
            let data_store = client_data.data.data.map((node, index) => {
                return {
                    id: node[0],
                    '微博名': node[16],
                    '微博': node[8],
                    '性别': node[19],
                    '关注数': node[15],
                    '粉丝数': node[11],
                    '微博数': node[19],
                    '点赞数': node[6],
                    // '直接转发数': x.children ? x.children.length : 0,
                    // '所在层级': src_retweet ? await tree_util.depth(x.mid, srcData) : 1,
                    '认证等级': node[24],
                    // '真实用户比例': index === 0 ? data_proportion : "",
                    // '转发层': index === 0 ? layer.toString() : ""
                }
            })
            if (data_store.length > 0) {
                SingleSheet.store(`./${this.dist_path}/${number}.xlsx`, data_store)
            }
        }
    }
    async batch_job() {
        let ret;
        await this.task_id()
        for (let i = 0, len = this.mid_queue.length; i < len; i++) {
            ret = await this.one_job(this.mid_queue[i])
            if (ret && ret.length > 0) {
                SingleSheet.store(`./${this.dist_path}/${i}.xlsx`, ret);
            } else {
                console.log('=====> Number [%s] failed in task ', i);
            }
        }
        console.log('Done ===========>')
    }

    async batch_execute() {
        let ret;
        await this.task_id()
        for (let i = 0, len = this.mid_queue.length; i < len; i++) {
            ret = await this.execute(this.mid_queue[i], i + 1)
            if (ret === null) console.log('=====> Number [%s] failed in task ', i)
        }
        console.log('Done ===========>')
    }


    async retweet_percentage_fill() {
        // let xlsxJson = SingleSheet.parse('/Users/musix/Desktop/微博导出转发占比/11-top30.xlsx')
            await mongoose.connect(config.db)
            let token = new weboSdk()
            process.env.token = await token.get_token()
            let data_store = []
            console.log('xlsx ---> ', this.source_list)
            for (let i = 0; i < this.source_list.length; i++) {
            try {
                let weibo = this.source_list[i]
                if((weibo['转发量']|0) >= 1000000) continue
                let url = weibo['链接']
                let mid = parseWeiboURL(url).mid
                console.log('mid ===>', mid)
                let task = new Task()
                task.set_mid(mid)
                await task.get_interface_data();
                let client_data = await Weibos.get(mid);
                if (client_data) {
                    // let client_data = await Weibos.get(mid);
                    console.log("Client_data", client_data);
                    if (client_data === undefined || client_data == 'data error') {
                        return []; // 数据出错 不做任何操作
                    } else {
                        let data_proportion = (client_data.data.data.length/client_data.total_number*100).toFixed(2)+'%'
                        let tree_data = tree_util.createTree(client_data.data.data, client_data.data.fields)
                        let layer = tree_util.retweet_layer_distribution(Object.values(tree_data.nodes))
                        let great3layer
                        if (layer.length >= 4) {
                            let great3Arr = layer.slice(3, layer.length)
                            let total = sum(layer)
                            let great3 = sum(great3Arr)
                            great3layer = (great3 / total * 100).toFixed(2) + "%"
                        } else {
                            great3layer = "0%"
                        }
                        console.log("layer ==>", layer);
                        console.log("tree_data ====>>", Object.values(tree_data.nodes).length);
                        let r_data = {
                            '剧目名称': weibo['剧目名称'],
                            '内容': weibo['内容'],
                            '内容带转发': weibo['内容带转发'],
                            '时间': weibo['时间'],
                            '转发量': weibo['转发量'],
                            '评论量': weibo['评论量'],
                            '点赞量': weibo['点赞量'],
                            '转发层级': weibo['转发层级'],
                            '链接': weibo['链接'],
                            '定向转发占比': data_proportion,
                            '转发层级1': layer.length-1,
                            '3级及以上转发占比': great3layer,
                            '抓取时间':weibo['抓取时间'],
                            '作者': weibo['作者'],
                            '简介': weibo['简介'],
                        }
                        // 5.4-12 字段
                        // let r_data = {
                        //     '剧目名称': weibo['剧目名称'],
                        //     '微博内容': weibo['微博内容'],
                        //     '链接': weibo['链接'],
                        //     '账号链接': weibo['账号链接'],
                        //     '转发量': weibo['转发量'],
                        //     '评论量': weibo['评论量'],
                        //     '点赞量': weibo['点赞量'],
                        //     '转发层级': weibo['转发层级'],
                        //     '定向转发占比': data_proportion,
                        //     '转发层级1': layer.length-1,
                        //     '3级及以上转发占比': great3layer,
                        //     '账号': weibo['账号'],
                        //     '当前粉丝量': weibo['当前粉丝量'],
                        //     '总帖子量': weibo['总帖子量'],
                        //     '平均转发量': weibo['平均转发量'],
                        //     '平均评论量': weibo['平均评论量'],
                        //     '平均点赞量': weibo['平均点赞量'],
                        // }
                        console.log('r_data ====== >',r_data)
                        data_store.push(r_data)
                        console.log("tree_data ====>>", Object.values(tree_data.nodes).length);
                        console.log("data_store", data_store);
                    }
                } 
                } catch (e) {
                    console.log(e)
            
                }
            }
            if (data_store.length > 0) {
                SingleSheet.store('./test/' + Date.now() + '.xlsx', data_store, 'sheet')
                console.log('finish !!!!!!')
                // return data_store;
            }
    }
}