var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var fs = require('fs');
var csslint = require('gulp-csslint');
var webpack = require('webpack');
var gutil = require('gulp-util');
var _ = require('lodash');
var webpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config.js');

/**
 * SASS-DEV
 * compile sass in 'src' directory and save in place to .css
 */
gulp.task('sass-dev', function () {
    return gulp.src(['./src/**/*.scss'])
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(gulp.dest('./src/theme/css'));
});


/**
 * WEBPACK-DEV
 * Bundle and serve app with webpack or port 8050
 */
gulp.task('webpack-dev-server', function() {

    var port = 8050;
    var config = Object.create(webpackConfig);
    config.devtool = 'eval';
    config.debug = true;

    _.forEach(config.entry, function(entry, key) {
        config.entry[key].unshift('webpack/hot/only-dev-server');
        config.entry[key].unshift('webpack-dev-server/client?http://localhost:' + port + '/');
    });

    // Start a webpack-dev-server
    new webpackDevServer(webpack(config), {
        contentBase: __dirname + '/src/',
        publicPath: config.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(port, 'localhost', function(err) {
        if(err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });

    gulp.watch(['./src/**/*.scss'], ['sass-css']);
});
