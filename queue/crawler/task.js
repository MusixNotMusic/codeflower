import Record from '../../models/records'
import Weibo from '../../models/weibos'
import Request from './request'
import Typheous from "typhoeus"
const _ = require('lodash');
const EventEmitter = require('events');

export default class Task extends EventEmitter {
    constructor(mid, url, count) {
            super();
            this.chips = [];
            this.mid = mid;
            this.fulfil = {};
            this.count = count || 50;
            this.page = 1;
            this.total_page = -1;
            this.total_number = -1;
            this.url = url;
            this.request = new Request();
            this.frequency = 1000;
            this.page_list = []; // Typheous 并发分页计数请求
        }
        /*
            deplex_data: 双工， 一边取数据， 一边存数据库
            每20页存入数据库一次，其余部分最后又计数器来完成标记存入，
            当计数器与剩余的total相同时存入数据
            
            每次存数据，有total记录剩余数据量，total -= 20
            total < 20 计数器开始累加，然后total === counter
            批量存入最后的数据
            问题：使用了原有函数merge_chips, merge_chips批量一次性处理全部数据，只会取出root一次，
                 每次20页数据合并时，都会调用merge_chips,但是减少内存支出，把retweeted_status字段删除了
                 merge_chips 中调用get_root需要这个字段发生错误。
        */
    async duplex_data() {
        // TODO 通过记录表查看 任务完成情况
        let isExist = await this.exist();
        if (isExist) {
            return await this.piece_db_data();
        } else {
            // 注册事件
            this.on('db.insert', async() => {
                let merge_piece = null;
                merge_piece = await this.merge_chips(this.mid, true);
                console.log('merge_piece', merge_piece.length);
                console.log('DB operation');
                await Weibo.insertMany(merge_piece);
                merge_piece = null;
            });
            await this.check();
            await this.allocation();
            await this.concurrency();
            // 删除记录信息
            console.log('isCompleted')
            return await this.piece_db_data();
        }
    }

    async get_interface_data() {
        let isExist = await this.exist();
        if (isExist) {
            return { message: 'data exist', code: 1010 };
        } else {
            // 从新浪接口拿数据
            // 注册事件
            this.on('db.insert', async() => {
                let merge_piece = null;
                // 
                merge_piece = await this.merge_chips(this.mid, true);
                console.log('merge_piece', merge_piece.length);
                console.log('DB operation');
                await Weibo.insertMany(merge_piece);
                merge_piece = null;
            });
            await this.check();
            await this.allocation();
            await this.concurrency();
            console.log('isCompleted')
        }
    }
    async get_db_data() {
        return await this.piece_db_data();
    }

    async task_status(record) {
        await Record.findOneAndUpdate({ mid: this.mid }, { $set: record }, { upsert: true });
    }

    // 数据是否存在
    async exist() {
        let isExist = await Weibo.findOne({ 'mid': this.mid }),
            isRecord = await Record.findOne({ 'mid': this.mid });
        console.log(!!isExist, isRecord, (isRecord && isRecord.status === 'complete'));
        return isExist && (isRecord && isRecord.status === 'complete');
    }

    //首次请求 获取 total_number total_page
    async check() {
            let record = {
                mid: this.mid,
                url: this.url || "",
                total_page: 0,
                current_page: 0,
                progress: 0,
                status: 'init',
                mem_lock: true,
                create_time: new Date(),
            }
            console.log('====> break ');
            let msg = await Record.collection.insert(record);
            console.log('msg====>', msg);
            if (msg.writeError) {
                throw ('task is running');
            }

            // let data = await this.request.get_data(this.count, this.mid, this.page)
            // this.chips.push(data);
            // if (data === null) {
            //     this.abort();
            //     return 'data error';
            // }
            // 找到一条数据并且退出
            let data
            do {
                data = await this.request.get_data(this.count, this.mid, this.page)
            } while (!data && (++this.page < 20))
            // 把接口数据直接格式化为数据库格式数据
            let db_data = await this.chip_format_db_data(data, true);
            if(!db_data) {
                let fail = {
                    mid: this.mid,
                    url: this.url || "",
                    total_page: 0,
                    current_page: 0,
                    progress: 0,
                    status: 'fail',
                    mem_lock: false,
                    create_time: new Date(),
                }
                console.log('无法获取必要分页信息 😇')
                await task_status(fail)
            }
            await Weibo.insertMany(db_data);

            this.total_number = data.total_number;
            this.total_page = Math.ceil(data.total_number / this.count); // 向上取整
        }
        // page_list 分配页数
    async allocation() {
            while (++this.page <= this.total_page) {
                this.page_list.push(this.page);
            }
        }
        // Typheous 并发请求
    async concurrency() {
        let rate = this.frequency / this.count,
            counter = 0,
            total = this.total_page - 1;
        let a = await Typheous.map(this.page_list, async(x) => {
                let result = await this.request.get_data(this.count, this.mid, x);
                if (result && result.reposts && result.reposts.length > 0) {
                    result.reposts.forEach((d) => {
                        delete d.retweeted_status;
                    })
                    this.chips.push(result);
                } else {
                    console.log("result.reposts === null");
                }
                // this.set_status({ 'message': '任务正在执行...', 'progress': Math.ceil((this.total_page - total - 1) / this.total_page * 100), status: 0 });
                counter++;
                let record = {
                    total_page: this.total_page,
                    current_page: counter,
                    progress: counter / this.total_page * 100 | 0,
                    status: 'running',
                    mem_lock: true,
                }
                await this.task_status(record);
                console.log('[Total, Rate, Chips_length, X]', total, rate, this.chips.length, x);
                // 每次存储 1000条数据。
                // if (total >= rate) {
                if (this.chips.length >= rate) {
                    console.log('total >= rate')
                        // total -= this.chips.length;
                    this.emit('db.insert');
                }
                // } else {
                //     counter++;
                //     console.log('[Counter]', counter);
                //     console.log('当数据小于1000条 total = %s counter = %s', total, counter);
                //     if (total === counter) { // 数据小于1000条时。
                //         this.emit('db.insert');
                //     }
                // }
                // result = null;
                return x.data;
            })
            // 将chips.length < rate 一次性存入数据库
        this.emit('db.insert');
        // this.set_status({ 'message': '任务正在完成', status: 1, type: 'net' });
        let record = {
            total_page: this.total_page,
            current_page: this.total_page,
            status: 'complete',
            progress: 100,
            mem_lock: false,
        }
        await this.task_status(record);
        if (a === null) {
            this.abort();
            return 'data error';
        }
        this.page_list = [];
    }

    abort() {
        console.log('任务流产');
    }

    set_mid(mid) {
        this.mid = mid;
    }

    async piece_db_data() {
        let count = await Weibo.find({ 'mid': this.mid }).count();
        console.log('[data count]', count);
        let page = Math.ceil(count / (this.frequency * 10)),
            cursor = -1;
        let chips = [],
            list = null,
            formatDate;
        // 每次取1000 条数据 把数据格式化减小数据体积，释放引用;
        while (++cursor < page) {
            console.log('[Page]', cursor);
            list = await Weibo.find({ mid: this.mid }).skip(cursor * (this.frequency * 10)).limit((this.frequency * 10));
            formatDate = await this.db_format_client_data(list, this.mid);
            list = null;
            chips.push(formatDate);
        }
        console.log('[piece_db_data.length]', chips.length);
        // 合并数据
        for (let i = 1; i < chips.length; i++) {
            chips[0].data.data = chips[0].data.data.concat(chips[i].data.data);
            chips[i] = null;
        }
        return chips[0];
    }


    // merge_chips 
    async merge_chips(mid, piece) {
            this.chips = this.chips.filter((c) => { return c && c.reposts && c.reposts.length > 0 })
            if (this.chips.length === 0) { return [] }
            let source = [],
                reposts = [];
            // 默认是 batch
            if (!piece) {
                reposts[0] = this.get_root(this.chips[0]); // 把root 放到 合并集合内部
            }
            console.log('[merge data]');
            for (let m = 0; m < this.chips.length; m++) {
                reposts = reposts.concat(this.chips[m].reposts);
                this.chips[m] = null;
            }
            console.log('[parllel data]');
            for (let i = 0; i < reposts.length; i++) {
                source[i] = await this.parallel_field_data_no_array(
                    reposts[i], {}, 'weibo', "retweeted_status");
                source[i].mid = mid;
                reposts[i] = null;
            }

            source[0].weibo_total_number = this.total_number
                // 还原状态
            console.log('merge data finished !!!');
            this.chips = [];
            reposts = null;
            return source;
        }
        //  同个任何一个片段都可以拿到 root 的数据


    get_root(chip) {
        if(!chip) return null
        let i = -1;
        do {
            i++;
        } while (chip.reposts && chip.reposts[i] && !chip.reposts[i].retweeted_status && i <= this.count);

        if (i > this.count) throw ('uncatch root data');
        return chip.reposts[i].retweeted_status;
    }


    // 数据库 数据格式相同
    parallel_field_data_no_array(obj, result, keyWord, filterWord) {
            return new Promise((resolve, reject) => {
                function recursion(src, des, _name, filter_key) {
                    for (let key in src) {
                        if (!Array.isArray(src[key])) {
                            if (key === filter_key) continue;
                            if (typeof src[key] === 'object') {
                                recursion(src[key], des, _name + "_" + key);
                            } else {
                                des[_name + '_' + key] = src[key]
                            }
                        }
                    }
                    return des;
                }
                let ok = recursion(obj, result, keyWord, filterWord)
                resolve(ok)
            })
        }
        // 将数据转为 canvas 使用的数据
        // 批量 直接转换， 
        // DB =======> client
    async db_format_client_data(source, mid) {
        let des = [],
            temp;
        for (let i = 0; i < source.length; i++) {
            temp = await this.extract_data_from_parallel(source[i])
            source[i] = null;
            if (mid === temp[0]) {
                temp[3] = null; //root parent null
                // // swap 取数据时，将root index = 0
                // let replace = des[0];
                // des[0] = temp;
                // temp = replace;
            }
            if (temp[0]) {
                des.push(temp)
            }
        }
        source = null;
        let format = await this.toString(this.total_number)
        format.data.data = des;

        return format;
    }

    //  Interface =========> client
    async interface_format_client_data(source, mid) {
        let des = [],
            temp;
        let format = await this.toString(this.total_number)
        for (let i = 0; i < source.length; i++) {
            temp = await this.extract_data_from_parallel(source[i]);
            des.push(temp);
            source[i] = null;
        }
        des[0][3] = null; //root parent null
        source = null;
        format.data.data = des;
        return format;
    }

    async chip_format_db_data(src, header) {
        let des = [];
        if(!src) return src
        if (header) {
            des[0] = await this.parallel_field_data_no_array(this.get_root(src), {}, 'weibo', "retweeted_status");
            des[0].mid = this.mid
            for (let i = 0; i <= src.reposts.length; i++) {
                des[i + 1] = await this.parallel_field_data_no_array(src.reposts[i], {}, 'weibo', "retweeted_status");
                des[i + 1].mid = this.mid;
            }
            src = null;
        } else {
            for (let i = 0; i < src.reposts.length; i++) {
                des[i] = await this.parallel_field_data_no_array(src.reposts[i], {}, 'weibo', "retweeted_status");
                des[i].mid = this.mid;
            }
            src = null;
        }
        return des;
    }

    async chip_format_client_data(src, header) {
            let format, des = [],
                temp;
            for (let i = 0; i < src.length; i++) {
                if (src[i].weibo_mid) { //id 是否存在
                    temp = await this.extract_data_from_parallel(src[i]);
                    des.push(temp);
                    src[i] = null;
                }
            }

            if (header) {
                des[0][3] = null; //root parent null
                format = await this.toString(this.total_number)
                format.data.data = des;
                return format;
            }
            src = null;
            return des;
        }
        //  从扁平化数据 抽取client_data

    extract_data_from_parallel(src) {
            let des = []
            return new Promise((resolve, reject) => {
                des.push(src.weibo_mid);
                des.push(src.weibo_mid);
                des.push(src.weibo_user_id);
                src.weibo_pid ? des.push(src.weibo_pid + "") : des.push(src.mid);
                des.push(src.weibo_created_at);
                des.push(src.weibo_reposts_count);
                des.push(src.weibo_attitudes_count);
                des.push(src.weibo_comments_count);
                des.push(src.weibo_text);
                des.push(src.weibo_text);
                des.push(src.weibo_user_created_at); //<---- ?
                des.push(src.weibo_user_followers_count);
                des.push(src.weibo_user_bi_followers_count);
                des.push(src.weibo_user_favourites_count);
                des.push(src.weibo_user_statuses_count);
                des.push(src.weibo_user_friends_count);
                des.push(src.weibo_user_name);
                des.push(src.weibo_user_screen_name);
                des.push(src.weibo_user_description);
                des.push(src.weibo_user_gender);
                des.push(src.weibo_user_province);
                des.push(src.weibo_user_city);
                des.push(src.weibo_user_verified);
                des.push(src.weibo_user_verified_reason);
                des.push(src.weibo_user_verified_type);
                des.push(src.weibo_user_location);
                des.push(src.weibo_user_avatar_hd);
                des.push(src.weibo_user_geo_enabled);
                des.push(src.weibo_user_cover_image_phone);
                des.push(src.weibo_geo); //暂时不要
                if (src.weibo_total_number) this.total_number = src.weibo_total_number
                resolve(des)
                    // return template
            })
        }
        // 直接从元数据抽取 client_data

    extract_data_from_source(src, mid) {
            let des = []
            return new Promise((resolve, reject) => {
                des.push(src.mid);
                des.push(src.mid);
                des.push(src.user.id);
                src.pid ? des.push(src.pid + "") : des.push(mid);
                des.push(src.created_at);
                des.push(src.reposts_count);
                des.push(src.attitudes_count);
                des.push(src.comments_count);
                des.push(src.text);
                des.push(src.text);
                des.push(src.user.created_at); //<---- ?
                des.push(src.user.followers_count);
                des.push(src.user.bi_followers_count);
                des.push(src.user.favourites_count);
                des.push(src.user.statuses_count);
                des.push(src.user.friends_count);
                des.push(src.user.name);
                des.push(src.user.screen_name);
                des.push(src.user.description);
                des.push(src.user.gender);
                des.push(src.user.province);
                des.push(src.user.city);
                des.push(src.user.verified);
                des.push(src.user.verified_reason);
                des.push(src.user.verified_type);
                des.push(src.user.location);
                des.push(src.user.avatar_hd);
                des.push(src.user.geo_enabled);
                des.push(src.user.cover_image_phone);
                des.push(src.geo);
                resolve(des)
                    // return template
            })
        }
        // id ===> 
    toString(total_number, page) {
        return new Promise((resolve, reject) => {
            let template = {
                // "messages4pages":pages,
                "data": {
                    "fields": [
                        "id",
                        "mid",
                        "uid",
                        "parent",
                        "t",
                        "reposts_count",
                        "attitudes_count",
                        "comments_count",
                        "text",
                        "original_text",
                        "user_created_at",
                        "followers_count",
                        "bi_followers_count",
                        "favourites_count",
                        "statuses_count",
                        "friends_count",
                        "username",
                        "screen_name",
                        "user_description",
                        "gender",
                        "province",
                        "city",
                        "verified",
                        "verified_reason",
                        "verified_type",
                        "user_location",
                        "user_avatar",
                        "user_geo_enabled",
                        "picture",
                        "geo"
                    ],
                    "data": []
                },
                "total_number": total_number
            }
            resolve(template)
                // return template
        })
    }
}