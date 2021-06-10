'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema; //类生产工厂

const Records = mongoose.Schema({
    mid: { type: String, unique: true },
    url: { type: String },
    status: { type: String }, // 内存中 init 初始化  running 正在运行  //数据库 complete  完成 uncomplete 未完成
    progress: { type: Number },
    total_page: { type: Number },
    current_page: { type: Number },
    create_time: { type: Date },
    update_time: { type: Date },
    mem_lock: { type: Boolean }, //当任务在内存中运行时，任务没有完成 并存入数据库时，不允许任何其他访问者读取该数据
})

const Model = mongoose.model('weibo_records', Records);

export default Model;