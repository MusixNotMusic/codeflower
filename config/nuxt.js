const webpack = require('webpack')
module.exports = {
    /*
     ** Headers of the page
     */
    head: {
        title: 'codeflower',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'Nuxt.js project' },
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: 'favicon1.ico' },
            { rel: 'stylesheet', href: 'http://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' },
            // { rel: 'stylesheet', href: 'https://cdn.bootcss.com/bulma/0.4.2/css/bulma.min.css' },
        ],
    },


    /*
     ** Global CSS
     */
    css: [{ src: '~assets/style/style.less', lang: 'less' },
        '~assets/style/reset.css',
        '~assets/style/font-awesome.min.css',
        '~assets/style/style-1.css',
    ],
    /*
     ** Customize the progress-bar color
     */
    build: {
        vendor: ['axios', 'element-ui'], // Add axios in the vendor.bundle.js


        plugins: [
            new webpack.ProvidePlugin({
                '_': 'lodash',
            }),
        ]
    },
    plugins: ['~plugins/element.js'],
    loading: {
        color: '#4FC08D',
        failedColor: '#bf5050',
        duration: 1500
    },

    env: {
        baseUrl: process.env.BASE_URL
    },

}