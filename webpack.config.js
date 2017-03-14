const path = require('path');
const webpack = require('webpack');

module.exports = {
    watch: true,
    cache: true,
    entry: {
        bundle: ['./src/index.jsx']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        chunkFilename: '[chunkhash].js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            // Required for transpile ES6 to ES5
            { test: /\.(js|jsx)$/, exclude: /node_modules/, loader: 'babel-loader?presets[]=es2015&presets[]=react' },

            // Handle importing css files directly into components
            { test: /\.css$/, loader: 'style-loader!css-loader' },

            { test: /\.json$/, exclude: /node_modules/, loader: 'json-loader' },

            // Handle importing images
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [ 'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },

            // Required for bootstrap icons
            { test: /\.woff$/, loader: 'url-loader?prefix=font/&limit=5000&mimetype=application/font-woff' },
            { test: /\.ttf$/, loader: 'file-loader?prefix=font/' },
            { test: /\.eot$/, loader: 'file-loader?prefix=font/' },
            { test: /\.svg$/, loader: 'file-loader?prefix=font/' }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};