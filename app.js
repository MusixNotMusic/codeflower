var Koa = require('koa');
import Server from './controllers';
var app = new Koa();
var server = new Server(app);

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