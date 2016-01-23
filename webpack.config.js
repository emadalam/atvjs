var
    webpack = require('webpack'),
    root = __dirname + '/src',
    entry = {
        app: './src/index.js'
    },
    output = {
        path: __dirname,
        library: 'ATV',
        libraryTarget: 'umd'
    },
    plugins = [new webpack.BannerPlugin('Copyright (c) Emad Alam http://emad.in\nhttps://github.com/emadalam/atvjs')];

module.exports.development = {
    debug: true,
    entry: entry,
    output: Object.assign({}, output, {filename: 'atv.js'}),
    resolve: {
        root: root
    },
    plugins: plugins,
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules|bower_components|native/,
            loader: 'babel-loader'
        }]
    }
};

module.exports.production = {
    debug: false,
    entry: entry,
    output: Object.assign({}, output, {filename: 'atv.min.js'}),
    resolve: {
        root: root
    },
    plugins: plugins,
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules|bower_components|native/,
            loader: 'babel-loader'
        }]
    }
};

module.exports.test = {
    resolve: {
        root: root
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules|bower_components|native/,
            loader: 'babel-loader'
        }]
    }
};