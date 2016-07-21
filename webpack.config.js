var path = require('path');
var webpack = require("webpack");

module.exports = {
    cache: true,
    watch: true,
    context: __dirname,
    entry: {
        app: './src/start.js'
    },
    output: {
        path: path.resolve(__dirname, 'src'),
        publicPath: '/scripts/',
        filename: '[name].js'
    },
    devtool: 'eval',
    debug: true,
    stats: {
        colors: true
    },
    module: {
        loaders: [
            // required to write "require('./style.css')"
            { test: /\.css$/,    loader: "style-loader!css-loader" },

            // required for bootstrap icons
            { test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
            { test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
            { test: /\.eot$/,    loader: "file-loader?prefix=font/" },
            { test: /\.svg$/,    loader: "file-loader?prefix=font/" }
        ]
    }
};