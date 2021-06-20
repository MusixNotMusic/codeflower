import Xlsx from './tasks/export/xlsx'
import Queues from './models/queues'
import Weibos from './models/weibos'
import Records from './models/records'
import { exist } from './models/common'
import * as mongoose from 'mongoose'
import { config } from './_base'
const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const parse_url = require('./lib/url_mid');
const archiver = require('archiver');

export default class Server extends EventEmitter {
    constructor(app, route) {
        super();
        
        this.app = app;
        this.server = '';
        const getBStatus = this.status_tasks.bind(this);
        const getBatch = this.batch_tasks.bind(this);
        const getBExport = this.batch_export.bind(this);

        const getCheck = this.check_tasks.bind(this);
        const getBDelete = this.delete_tasks.bind(this);
        const getStatus = this.get_status.bind(this);
        const getData = this.complete_task.bind(this);
        const launch = this.start_task.bind(this);
        const excel = this.get_excel.bind(this);
        const exist = this.to_exist.bind(this);
        const del = this.to_delete.bind(this);
        const getAllMid = this.getAllMid.bind(this)
        route.post('/batch.json', getBatch);
        route.post('/check.json', getCheck);
        route.post('/bstatus.json', getBStatus);
        route.post('/bdelete.json', getBDelete);
        route.post('/bexport.json', getBExport);
        route.get('/status.json', getStatus);
        route.get('/data.json', getData);
        route.get('/launch.json', launch);
        route.get('/excel.json', excel);
        route.get('/exist.json', exist);
        route.get('/delete.json', del);
        route.get('/getAllMid', getAllMid)
    }

    async init() {
        console.log('[Launch Koa Server port in 3100]');
        this.app.listen(3100);
        console.log("config ===>", config);
        await mongoose.connect(config.db);
        process.env.baseUrl = config.baseUrl;
        this.emit('web.init');
        console.log("[Init Nuxt...]");
    }

    // [Note]当数据量请求较大时，浏览器会重复请求，当数据拿到后，浏览器请求超时，重新请求数据，这是数据库操作没有完成，
    // 数据不完整，直接去拿到的数据存在问题

    async batch_tasks(ctx) {
        let urls = ctx.request.body.urls;
        for (let i = 0; i < urls.length; i++) {
            await Queues.add(urls[i]);
        }
        ctx.body = {
            message: "已经加入任务队列",
            status: "success"
        }
    }

    async check_tasks(ctx) {
        let urls = ctx.request.body.urls;
        let sheet = ctx.request.body.sheet;
        console.log('urls', ctx.request.body)
        let ret = {};
        for (let i = 0; i < urls.length; i++) {
            let mid = parse_url(urls[i]).mid;
            let result = await exist(mid);
            if (result.operate_code === 3) {
                result.progress = 100;
            } else {
                result.progress = 0;
            }
            ret[urls[i]] = result;
        }
        ctx.body = {
            data: ret,
            sheet: sheet
        };
    }

    async delete_tasks(ctx) {
        let urls = ctx.request.body.urls;
        console.log('Delete [Status]:', urls);
        try {
            for (let i = 0; i < urls.length; i++) {
                let mid = parse_url(urls[i]).mid;
                let wret = await Weibos.remove({ 'mid': mid });
                let rret = await Records.remove({ 'mid': mid });
            }
            ctx.body = {
                status: 'success',
                message: '删除数据成功!'
            }
        } catch (e) {
            console.error(e);
            ctx.body = {
                status: 'fail',
                message: '服务器出错了!'
            }
        }
    }

    async status_tasks(ctx) {
        let urls = ctx.request.body.urls;
        let sheet = ctx.request.body.sheet;
        let ret = {},
            counter = 0, //让前端定时器停止
            item;
        try {
            for (let i = 0; i < urls.length; i++) {
                let mid = parse_url(urls[i]).mid;
                if(!mid) continue
                let result = await Records.findOne({ 'mid': mid });
                if (result) {
                    item = result;
                    if (result.status === "complete") {
                        counter++;
                    }
                } else {
                    let pos = await Queues.rank(urls[i]);
                    if (pos !== null) {
                        item = {
                            message: "前方还有" + pos + "个任务",
                            status: "success",
                            progress: 0,
                        }
                    } else {
                        item = {
                            message: "任务不存在",
                            status: "failed",
                            progress: 0,
                        }
                    }
                }
                ret[urls[i]] = item;
            }

            if (counter == urls.length) {
                counter = "complete"
                console.log("status_tasks ==> 任务全部完成")
            } else {
                counter = "uncomplete"
            }
            ctx.body = {
                data: ret,
                sheet: sheet,
                status: counter
            }
        } catch (e) {
            throw (e);
        }
    }

    async batch_export(ctx) {
        let urls = ctx.request.body.urls;
        let xlsx = new Xlsx(Weibos, null, './static/output');
        let archive = archiver('zip');
        archive.on('error', function(err) {
            throw err;
        });
        let time = new Date().getTime();
        let output = fs.createWriteStream(__dirname + "/static/output/" + time + ".zip");
        archive.pipe(output);
        for (let i = 0; i < urls.length; i++) {
            // let mid = parse_url(urls[i]).mid;
            let mid = 4120359848332972
            let ret = await exist(mid);
            if (ret.operate_code === 3) {
                try {
                    let result_buffer = await xlsx.one_job_buffer(mid);
                    archive.append(result_buffer, { name: i + '.xlsx' });
                } catch (e) {
                    continue;
                }
            }
        }
        archive.finalize();
        ctx.body = {
            path: "/output/" + time + ".zip",
            message: "数据处理完成",
            status: "success",
        };
    }

    // 启动任务,获取数据
    async start_task(ctx) {
        let url = ctx.request.query.url;
        let result = await Queues.add(url);
        if (result) {
            ctx.body = {
                message: "已经加入任务队列",
                status: "success"
            }
        } else {
            ctx.body = {
                message: "加入任务队列失败",
                status: "failed"
            }
        }
        // 任务完成删除
    }

    async complete_task(ctx) {
        let url = ctx.request.query.url;
        // let mid = parse_url(url).mid;
        let mid = this.getMid(ctx.request.query)
        let result = await Weibos.get(mid);
        if (result) {
            ctx.body = result;
            ctx.compress = true
            ctx.set('Content-Type', 'text/plain')
        } else {
            ctx.body = { message: "task uncomplete", code: 1004 };
        }
    }

    // async get_piece(ctx) {
    //     let url = ctx.request.query.url;
    //     console.log('URL:', url);
    //     let mid = parse_url(url).mid;
    //     let task = new Task(mid, this.token, secret.client_id);
    //     ctx.body = await task.get_data();
    // }

    async get_status(ctx) {
        let url = ctx.request.query.url;
        console.log('URL [Status]:', url);
        let parseStr = parse_url(url)
        let mid = this.getMid(ctx.request.query)
        let result = await Records.findOne({ 'mid': mid, parseStr });
        console.log('status===>', result);
        if (result) {
            ctx.body = result;
        } else {
            let pos = await Queues.rank(url);
            if (pos !== null) {
                ctx.body = {
                    message: "前方还有" + pos + "个任务,请耐心等待",
                    status: "success",
                    progress: 0,
                }
            } else {
                ctx.body = {
                    message: "任务不存在丢失",
                    status: "failed",
                    progress: 0,
                }
            }
        }
    }

    async to_exist(ctx) {
        let url = ctx.request.query.url;
        console.log('Exsit [Status]:', url, parse_url(url));
        // let mid = parse_url(url).mid;
        let mid = this.getMid(ctx.request.query)
        let result = await exist(mid);
        console.log('exist result===>', result);
        ctx.body = result;
    }

    async to_delete(ctx) {
        let url = ctx.request.query.url;
        console.log('Delete [Status]:', url);
        try {
            // let mid = parse_url(url).mid;
            let mid = this.getMid(ctx.request.query)
            let wret = await Weibos.remove({ 'mid': mid });
            let rret = await Records.remove({ 'mid': mid });
            ctx.body = {
                status: 'success',
                message: '删除数据成功!'
            }
        } catch (e) {
            console.error(e);
            ctx.body = {
                status: 'fail',
                message: '服务器出错了!'
            }
        }
    }

    async get_excel(ctx) {
            let mid = this.getMid(ctx.request.query)
            let xlsx = new Xlsx(Weibos, null, './static/output');
            let result_buffer = await xlsx.one_job_buffer(mid);
            console.log(result_buffer);
            ctx.set('Content-disposition', 'inline;filename=' + mid + '.xlsx');
            ctx.set('Content-type', 'application/x-xls');
            ctx.body = result_buffer;
        }
        // 1、微博接口数据为倒序排列
        //  前提条件 是 在获取 n条数据的时间t范围内，微博转发增量∆的t事件内非常非常小,满足一下条件:
        //  假设 第一次 去拿数据, 共有n页, 第n页数据量item1,count每页条数 1≤item1≤count
        //       第二次 去拿数据,共有m页(m>n),第n页数据量item2,count每页条数 1≤item2≤count
        //       n页时:最后一页可能不为全页(øn),   m页时:最后一页可能不为全页(øm)
        //       第二次更新数据时 m的最大页数 为m-n+1,更新
        //                First                                         Second
        //             ________________                      ________________________ 
        //     header /_4_/_3_/_2_/_1_/ tail  n      header /_6_/_5_/_4_/_3_/_2_/_1_/ tail m
        //     上面情况，会在倒序的第四页出现数据重复和新数据 因此 m-n+1
    async to_update(ctx) {

    }

    async getAllMid(ctx) {
        // let mid = parse_url(url).mid;
        let result = await Weibos.getAllMid();
        if (result) {
            ctx.body = result;
        } else {
            ctx.body = { message: "not find mid id list", code: 1005 };
        }
    }



    getMid(query) {
        let numberReg = /^\d+$/
        let url = query.url
        let mid = ''
        if (numberReg.test(url)) {
            mid = url
        } else {
            mid = parse_url(url).mid
        }
        return mid
    }
}
//
//
//