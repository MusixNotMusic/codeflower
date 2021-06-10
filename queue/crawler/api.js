const http = require('https');
const querystring = require('querystring');
const request = require('request');
const sleep = require('sleep');
const miss = require('mississippi2');

export default class Api {
    constructor() {
        this.path = '';
        this.token = process.env.token;
    }

    async Get(oops, no) {

        let url = 'c.api.weibo.com';
        if (no) url = 'api.weibo.com';
        const options = {
            uri: `https://${url}/2${this.handle_path()}?access_token=${this.token}&${querystring.stringify(oops)}`,
            method: 'GET',
        };
        console.log('[Uri]', options.uri)
        let res, json;
        try {
            res = request(options);
            json = await this.toJson(res);
        } catch (e) {
            console.log('[Json Error]', e);
            console.log('[Request Retry]');
            try {
                sleep.msleep(1000);
                res = request(options);
                json = await this.toJson(res);
            } catch (e) {
                console.log('[Throw Json]', e);
                json = JSON.stringify({});
            }
        }
        return json;
    }

    toJson(res) {
        return new Promise((resolve, reject) => {
            const req = miss.toJSON(res, (err, data) => {
                if (err) reject(err);
                resolve(data);
            })
        })
    }

    Post(oops) {
        let url = 'api.weibo.com';

        oops.access_token = this.token;
        const options = {
            uri: `https://${url}/2${api.handle_path()}`,
            method: 'POST',
            form: oops
        }

        //console.log(oops);
        //console.log(options);
        return new Promise((resolve, reject) => {
            const req = miss.toJSON(request(options), function(err, res) {
                if (err) reject(err);
                console.log(`[GET from ${options.uri}]: ${res}`);
                resolve(res)

            })
        })

    }
    handle_path() {
        let a = this.path.split('/');
        a.slice(-3, 3);
        return a.join('/') + '.json';
    }
}