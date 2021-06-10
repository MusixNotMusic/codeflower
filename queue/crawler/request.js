import Api from "./api"

const check_source = require('./error')
const time_limit = require('../../lib/time')
const secret = require("../auth/secret.json")
    //================================mid list=====================================
    /*
        '/statuses/user_timeline_batch' 接口数据为时间倒序
        在时间限制内没有找到对应的mid，当前集合数据{A}> {timel}
        翻页，{A}∩{timel} 存在需要数据
    */
export default class Request {
    constructor() {
        this.api = new Api()
    }

    async get_mid_list(uid, start_time, diff, pole) {
        let mid_list = [],
            page = 1;
        let data,
            done = false,
            timel = time_limit(start_time, diff, pole),
            lower_t,
            upper_t;
        console.log('get mid_list timel[0] = %s , timel[1] = %s', timel[0], timel[1])
        do {
            data = await this.get_weibo_list(uid, page)
            if (!data.statuses || !data.statuses.length) return null
            lower_t = new Date(data.statuses[data.statuses.length - 1].created_at).getTime() //第i页 最后一条数据
            upper_t = new Date(data.statuses[0].created_at).getTime() //第i页 第一条数据
            console.log('lower_t = %s , upper_t = %s', lower_t, upper_t)
                // {timed} ∩ {timel} =  ∅
            if (upper_t < timel[0] && lower_t < timel[0]) {
                return mid_list;
                // {timed} ∈ {timel}
            } else if (lower_t > timel[0] && timel[1] > upper_t) {
                await this.push_mid_list(data, mid_list, timel, page, 'A');
                // {timed} ∩ {timel} ≠ ∅ && timel[0] ∈ {timed}
            } else if (lower_t <= timel[0] && timel[0] < upper_t) {
                await this.push_mid_list(data, mid_list, timel, page, 'B');
                done = true
                    // {timed} ∩ {timel} ≠ ∅ && timel[1] ∈ {timed}
            } else if (lower_t < timel[1] && upper_t >= timel[1]) {
                await this.push_mid_list(data, mid_list, timel, page, 'C');
            }
            if (done) break;
        } while (page++ < (Math.ceil(data.total_number / 20)));
        // console.log('get_mid_list===>',mid_list)
        return mid_list;
    }

    async get_user_list(uid, start_time, diff, pole) {
            let user_list = [],
                page = 1;
            let data,
                done = false,
                timel = time_limit(start_time, diff, pole),
                lower_t,
                upper_t;
            console.log('get mid_list timel[0] = %s , timel[1] = %s', timel[0], timel[1])
            do {
                data = await this.get_weibo_list(uid, page)
                if (!data.statuses || !data.statuses.length) return null
                lower_t = new Date(data.statuses[data.statuses.length - 1].created_at).getTime() //第i页 最后一条数据
                upper_t = new Date(data.statuses[0].created_at).getTime() //第i页 第一条数据
                console.log('lower_t = %s , upper_t = %s', lower_t, upper_t)
                    // {timed} ∩ {timel} =  ∅
                if (upper_t < timel[0] && lower_t < timel[0]) {
                    return user_list;
                    // {timed} ∈ {timel}
                } else if (lower_t > timel[0] && timel[1] > upper_t) {
                    await this.push_user_list(data, user_list, timel, page, 'A');
                    // {timed} ∩ {timel} ≠ ∅ && timel[0] ∈ {timed}
                } else if (lower_t <= timel[0] && timel[0] < upper_t) {
                    await this.push_user_list(data, user_list, timel, page, 'B');
                    done = true
                        // {timed} ∩ {timel} ≠ ∅ && timel[1] ∈ {timed}
                } else if (lower_t < timel[1] && upper_t >= timel[1]) {
                    await this.push_user_list(data, user_list, timel, page, 'C');
                }
                if (done) break;
            } while (page++ < (Math.ceil(data.total_number / 20)));
            return user_list;
        }
        //分页 
    async get_weibo_list(uid, page) {
        this.api.path = '/statuses/user_timeline_batch'
        let oops = {
            uids: uid,
            page: page
        }
        let data = await this.api.Get(oops);
        return data
    }

    async push_mid_list(data, user_list, timel, page, area) {
        var timed = -1;
        for (let i = 0, len = data.statuses.length; i < len; i++) {
            timed = new Date(data.statuses[i].created_at).getTime()
            if (timel[0] <= timed && timed <= timel[1]) {
                console.log('area %s time[%s] page = %s', area, i, page, timed)
                user_list.push(data.statuses[i].mid)
            }
        }
    }

    async push_user_list(data, user_list, timel, page, area) {
        var timed = -1;
        for (let i = 0, len = data.statuses.length; i < len; i++) {
            timed = new Date(data.statuses[i].created_at).getTime()
            if (timel[0] <= timed && timed <= timel[1]) {
                console.log('area %s time[%s] page = %s', area, i, page, timed)
                user_list.push(data.statuses[i])
            }
        }
    }

    async get_weibo_list(uid, page) {
            this.api.path = '/statuses/user_timeline_batch'
            let oops = {
                uids: uid,
                page: page
            }
            let data = await this.api.Get(oops),
                return data
        }
        // ================================粉丝、好友、无关判断=====================================
        // https://api.weibo.com/2/friendships/show.json?access_token=2.00tUPeHGnDPE4Dd4b90b40ef044cQQ&source_id=1845864154&target_id=1411922832
    async get_relationship(t_uid, s_uid) {
        this.api.path = '/friendships/show'
        let oops = {
            source_id: t_uid,
            target_id: s_uid
        }
        let data = await this.api.Get(oops, true);
        console.log('[Data relation]', data)
            // -1 无关, fans 0  好友 1
        if (data.source.followed_by && data.target.followed_by) {
            return 1
        } else if (data.source.followed_by && !data.target.followed_by) {
            return 0
        } else if (!data.source.followed_by && !data.target.followed_by) {
            return -1
        }
    }

    // ================================一次获取数据by mid=====================================
    async get_data(count, mid, page) {
        this.api.path = '/statuses/repost_timeline/all';
        let oops = {
                source: secret.client_id,
                filter_by_author: 0,
                count: count,
                id: mid,
                page: page
            }
            //  第一次处理请求拿出， 创建完整任务
        let data = await this.api.Get(oops);
        if (check_source(data)) {
            return data
        } else {
            return null
        }
    }
}