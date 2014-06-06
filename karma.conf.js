module.exports = function(config) {
    config.set({
        basePath: '',
        exclude: [
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true,

        frameworks: ['mocha', 'browserify'],

        files: [
            'src/simple-event-handler.js',
        ],

        preprocessors: {
            "/**/*.browserify": "browserify"
        },

        browserify: {
            debug: true,
            files: [
              'test/**/*.test.js'
            ],
            transform: [
              'espowerify'
            ]
        }
    });
};
