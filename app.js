import * as Router from 'koa-router'
var Koa = require('koa');
const cors = require('koa-cors');
const path = require('path');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const compress = require('koa-compress')
import Server from './controllers';
var app = new Koa();
const route = new Router();
const zlib = require('zlib')
app.use(logger());
// app.use(cors());
// app.use(bodyparser());
// app.use(route.routes());
app.use(compress({
    threshold: 1024,
    gzip: {
        flush: zlib.constants.Z_SYNC_FLUSH
    },
    deflate: {
        flush: zlib.constants.Z_SYNC_FLUSH,
    },
})).use(cors())
   .use(bodyparser())
   .use(route.routes())
var server = new Server(app, route);

var config = require(__dirname + '/config/nuxt.js');
var Nuxt = require('nuxt');
server.on('web.init', () => {
    config.dev = !(app.env === 'production')
    var nuxt = new Nuxt(config)
    if (config.dev) {
        nuxt.build()
            .catch((error) => {
                console.error(error) // eslint-disable-line no-console
                process.exit(1)
            })
    }

    app.use(async(ctx, next) => {
        ctx.status = 200 // koa defaults to 404 when it sees that status is unset
        await nuxt.render(ctx.req, ctx.res)
    })
});
/************** Memwatch **********************/
// var memwatch = require('memwatch-next');
// var heapdump = require('heapdump')
// memwatch.on('leak', function(info) {
//     console.error(info);
//     var file = '/tmp/myapp-' + process.pid + '-' + Date.now() + '.heapsnapshot';
//     heapdump.writeSnapshot(file, function(err) {
//         if (err) console.error(err);
//         else console.error('Wrote snapshot: ' + file);
//     });
// });

server.init();