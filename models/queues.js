'use strict'
import { ObjectID } from "mongodb"
const mongoose = require('mongoose')
const parse_url = require('../lib/url_mid');
const Schema = mongoose.Schema //类生产工厂


const Queue = mongoose.Schema({
    _id: { type: String, unique: true },
    name: { type: String, default: "codeflower" },
    url: { type: String },
    create_time: { type: Date },
    priority: { type: Number },
    is_delete: { type: Boolean, default: false }
})

Queue.statics.check = async function() {
    let tasks = await this.find({ 'is_delete': false }).sort({ "create_time": 1 }).skip(0).limit(1);
    console.log('tasks===>', tasks);
    if (tasks[0]) {
        let url = tasks[0].url;
        if (!url) {
            return null;
        } else {
            return {
                mid: parse_url(url).mid,
                id: tasks[0]._id
            }
        }
    }
    return null;
}

Queue.statics.add = async function(url) {
    let result = await this.collection.insert({
        url: url,
        create_time: new Date(),
        is_delete: false,
        priority: 0,
    })
    return result;
}

Queue.statics.remove = async function(id) {
    console.log('ID===>', id);
    let result = await this.collection.update({ _id: ObjectID(id) }, { $set: { 'is_delete': true } });
    if (!result) {
        throw ("mongodb remove error");
    }
}

Queue.statics.rank = async function(url) {
    let result = await this.find({ 'is_delete': false }).sort({ "create_time": 1 })
    if (result) {
        for (let i = 0; i < result.length; i++) {
            if (result[i].url == url) {
                return i;
            }
        }
    }
    return null;
}

const Model = mongoose.model('queues', Queue);

export default Model;