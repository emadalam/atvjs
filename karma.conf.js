var
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js').test;

module.exports = function(config) {
    config.set({

        basePath: '',

        frameworks: ['mocha'],

        files: [
            'tests/index.js'
        ],

        preprocessors: {
            'tests/*': ['webpack']
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: {
                colors: true
            },
            quiet: true
        },

        reporters: ['spec'], // use mocha if you like

        port: 9876,

        colors: true,

        logLevel: config.LOG_DISABLE,

        autoWatch: true,

        browsers: ['Chrome'],

        captureTimeout: 60000,

        singleRun: false,

        plugins: [
            require('karma-webpack'),
            require('karma-mocha'),
            require('karma-spec-reporter'),
            require('karma-chrome-launcher'),
            require('karma-mocha-reporter')
        ]
    });
};