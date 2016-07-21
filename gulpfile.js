var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var fs = require('fs');
var csslint = require('gulp-csslint');
var webpack = require('webpack');
var gutil = require('gulp-util');
var webpackDevServer = require('webpack-dev-server');

var webpackConfig = require('./webpack.config');

// SERVE-DEV
gulp.task('serve-dev', ['webpack', 'sass'], function () {
    // gulp.watch(['./src/**/*.js', '!./src/scripts/**/*.js'], ['webpack']);
    gulp.watch('./src/theme/scss/**/*.scss', ['sass']);
});


// WEBPACK
gulp.task('webpack', function () {
    var config = Object.create(webpackConfig);

    new webpackDevServer(webpack(config))
        .listen(8080, 'localhost', function(err) {
            if (err) throw new gutil.PluginError('webpack-dev-server', err.toString());
            
            gutil.log('[webpack-dev-server]', 'http://localhost:8080/src');
        });
});


// SASS
gulp.task('sass', function () {
    return gulp.src('./src/theme/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./src/theme/css'));
});


// CSS LINT
gulp.task('csslint', function () {
    var ignoreBootstrap = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });
    var output = '';

    return gulp.src('./src/public/theme/scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(ignoreBootstrap)
        .pipe(csslint())
        .pipe(csslint.reporter('junit-xml', {
            logger: function (str) {
                var reportsDir = 'reports';
                if (!fs.existsSync(reportsDir)) {
                    shell.mkdir('-p', reportsDir);
                }

                output += str;
                fs.writeFile(reportsDir + '/csslint-junit.xml', output);
            }
        }));
});


gulp.task('csslint-cli', function () {
    var ignoreBootstrap = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });

    return gulp.src('./src/public/theme/scss/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(ignoreBootstrap)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});
