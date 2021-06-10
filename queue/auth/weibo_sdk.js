//import userdb from '../model/user'
const http = require('https');
const querystring = require('querystring');
const request = require('request');

const execSync = require('child_process').execSync;
const fs = require('fs');
// const auth_login = spawn('casperjs', [__dirname + '/auth_code.js']);
const secret = require('./secret.json');


class weboSdk {
    constructor(appkey, secrt, callback_url) {
        this.appkey = appkey || secret.client_id;
        this.secrt = secrt || secret.secretApp;
        this.callback_url = callback_url || secret.redirect_uri;
        this.access_token = {};
        this.uid = '';
        this.expires_in = '';
    }

    get_authorization_code() {
        // return new Promise((resolve, reject) => {
        //     auth_login.stdout.on('data', (data) => {
        //         if (data.toString().toLowerCase().match('success')) {
        //             console.log(`${data}`);
        //         } else {
        //             console.log('[Code Data]', data.toString('utf8'));
        //             // throw ('[Code Error]');
        //         };
        //     });

        //     auth_login.on('exit', (code) => {
        //         console.log('close');
        //         fs.readFile('./auth.code', 'utf8', (err, data) => {
        //             if (err) reject(new Error(err));
        //             console.log('[Code Number]', data)
        //             return resolve(data);
        //         });
        //     });
        // })
        let output = execSync(`casperjs ${process.cwd()}/queue/auth/auth_code.js`).toString()
        console.log('output ---> ',output)
        if (output.toString().toLowerCase().match('success')) {
            let code = fs.readFileSync(`${process.cwd()}/auth.code`, 'utf8')
            console.log(code)
            return code 
        } else {
            console.log('[Code Data]', output[i].toString('utf8'));
            throw ('[Code Error]');
        }
    }

    request_access_token(code) {
        // let me = this;
        let data = {
            "client_id": this.appkey,
            "client_secret": this.secrt,
            "grant_type": "authorization_code",
            "redirect_uri": this.callback_url
        }
        data.code = code;
        return new Promise((resolve, reject) => {
            const options = {
                "method": "POST",
                "hostname": "api.weibo.com",
                "port": null,
                "path": "/oauth2/access_token",
                "headers": {
                    "cache-control": "no-cache",
                    "postman-token": "a4aead88-143d-eaec-60c9-b54f3afab76c",
                    "content-type": "application/x-www-form-urlencoded"
                }
            };
            const req = http.request(options, (res) => {
                let userMsg;
                res.on('data', (chunk) => {
                    userMsg = JSON.parse(chunk);
                    this.access_token = userMsg.access_token;
                    this.uid = userMsg.uid;
                    this.expires_in = userMsg.expires_in;
                    console.log('[Uid Token Expires] ', this.uid, this.access_token, this.expires_in)
                });
                res.on('end', () => {
                    resolve(this.access_token)
                });
            })
            req.write(querystring.stringify(data))
            req.end();
            req.on('error', (e) => {
                reject(new Error(e))
            })

        })
    }

    async get_token() {
        console.log('[Start Athorization From Sina_Weibo]');
        try {
        let code = this.get_authorization_code()
        console.log('[code]', code)
            let token = await this.request_access_token(code);
            if (!token) throw ('[Token Error]')
            return token;
        } catch (err) {
            throw (err);
        }
    }

    detect_token(oops) {
        const options = {
            uri: `https://api.weibo.com/oauth2/get_token_info`,
            method: 'POST',
            form: oops
        }

        return new Promise((resolve, reject) => {
            const req = miss.toJSON(request(options), function(err, res) {
                if (err) reject(err);
                resolve(res)
            })
        })
    }

    save_access_token(token) {
        this.access_token = token;
    }

}
export { weboSdk };
// module.exports = token_me;