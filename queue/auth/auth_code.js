var secret = require('./secret.json');
console.log(secret.auth_code_url);
const fs = require('fs');
const reg_url = /^http:\/\/api.weibo.com\/oauth2\/default.html/;
const casper = require('casper').create({
    waitTimeout: 10000,
    verbose: true,
    logLevel: "debug",
});


casper.start()
var hey = require('./hello.json');
casper
    .thenOpen(secret.auth_code_url)
    .then(function() {
        this.evaluate(
            function(username, password) {
                var userId = document.getElementById('userId');
                var passwd = document.getElementById('passwd');
                userId.value = username;
                passwd.value = password;
            }, hey)
    })
    .thenClick(".WB_btn_login", function() {
        this.echo('=====> ' + this.getCurrentUrl());
    })
    .waitForUrl(reg_url, function(data) {
        this.echo('[Success]:' + this.getCurrentUrl())
        fs.write('./auth.code', this.getCurrentUrl().split('?')[1].split('=')[1],
            function(err, written, buffer) {
                if (err) throw err;
                // this.echo('code in auth.code')
            })
    });
casper.run()