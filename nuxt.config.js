import webpack from 'webpack';

let dev = process.env.NODE_ENV !== 'production'

export default {
    router: {
      base: '/comunica-packager/'
    },
    mode: 'spa',
    /*
    ** Headers of the page
    */
    head: {
        titleTemplate: '%s - ' + process.env.npm_package_name,
        title: process.env.npm_package_name || '',
        meta: [
            {charset: 'utf-8'},
            {name: 'viewport', content: 'width=device-width, initial-scale=1'},
            {hid: 'description', name: 'description', content: process.env.npm_package_description || ''}
        ],
        link: [
            {rel: 'icon', type: 'image/x-icon', href: '/comunica-packager/favicon.ico'}
        ]
    },
    /*
    ** Customize the progress-bar color
    */
    loading: {color: '#BE1622'},
    /*
    ** Global CSS
    */
    css: [
        '@/assets/main.scss',
        '@/assets/variables.scss',
    ],
    /*
    ** Plugins to load before mounting the App
    */
    plugins: ['@/plugins/select.js'],
    /*
    ** Nuxt.js dev-modules
    */
    buildModules: [
        '@nuxt/typescript-build',
        '@nuxtjs/vuetify',
    ],
    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios'
    ],
    /*
    ** Axios module configuration
    ** See https://axios.nuxtjs.org/options
    */
    axios: {
        baseURL: dev ? 'http://localhost:3000/' : 'https://comunica.github.io/'
    },
    /*
    ** vuetify module configuration
    ** https://github.com/nuxt-community/vuetify-module
    */
    vuetify: {
        customVariables: ['~/assets/variables.scss'],
        theme: {
            themes: {
                light: {
                    primary: '#be1622',
                    secondary: '#9C0510'
                }
            }
        }
    },
    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        extend(config, ctx) {
        },
        plugins: [
            new webpack.ProvidePlugin({
                '_': 'lodash'
            })
        ]
    }
}
