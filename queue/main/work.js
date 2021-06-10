import { weboSdk } from '../auth/weibo_sdk'
import * as mongoose from 'mongoose'
import { config } from '../../_base'

const EventEmitter = require('events');
const sleep = require('sleep');
const parse_url = require('../../lib/url_mid');
/**
 *  消费者 负责处理数据
 *  关联的数据库 表 ===> records任务状态  task任务队列
 *  任务可能出现的情况 ==> 
 *      1、获取task队列当前状况，(当存在数据的时候get，否则 sleep)
 *      2、正常完成任务  更新records  task
 *      3、非正常停止 检查任务状态重新启动任务
 * */
let trampoline = async(kont) => {
    while (typeof(kont) == 'function') {
        kont = await kont()
    }
    return kont
}

import Records from "../../models/records"
import Queue from "../../models/queues"
import Task from "../crawler/task"
export default class Worker extends EventEmitter {
    constructor() {
        super();
        this.on('auth', this.auth);
        this.on('init', this.init);
        this.on('run', this.run);
        this.timer = null;
    }

    async auth() {
        // mongodb
        await mongoose.connect(config.db);
        //验证
        let token = new weboSdk()
        process.env.token = await token.get_token()
        this.emit('init')
    }

    async init() {
        console.log('123', process.env.token);
        // this.task = new Task();

        this.emit('run')
    }

    async stop() {

    }

    async pause() {

    }

    async error() {

    }


    async run() {

        let _launch = async() => {
            console.log("[%s --- %s]: ", new Date().toLocaleDateString(), new Date().toLocaleTimeString())
            let data = await Queue.check();
            let task = new Task();
            console.log('run mid===>', data)
            if (data && data.mid) {
                task.set_mid(data.mid);
                await Queue.remove(data.id);
                try {
                    let result = await task.get_interface_data();
                } catch (e) {
                    console.log(e);
                    sleep.sleep(1);
                }
                sleep.sleep(1);
            } else {
                sleep.sleep(5);
            }
            data = null;
            task = null;
            return setImmediate(_launch)
        }
        _launch();
    }
}