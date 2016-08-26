var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var eslint = require('gulp-eslint');
var csslint = require('gulp-csslint');
var filter = require('gulp-filter');
var mocha = require('gulp-mocha');
var batch = require('gulp-batch');
var gulpUtil = require('gulp-util');
var gulpCopy = require('gulp-copy');
var autoprefixer = require('autoprefixer');
var shell = require('shelljs');
var webpack = require('webpack');
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

    _.forEach(config.entry, function (entry, key) {
        config.entry[key].unshift('webpack/hot/only-dev-server');
        config.entry[key].unshift('webpack-dev-server/client?http://localhost:' + port + '/');
    });

    // Start a webpack-dev-server
    new webpackDevServer(webpack(config), {
        contentBase: path.join(__dirname, '/src/'),
        publicPath: config.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(port, 'localhost', function (err) {
        if (err) { throw new gulpUtil.PluginError('webpack-dev-server', err); }
        gulpUtil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });

    gulp.watch(['./src/**/*.scss'], ['sass-css']);
});


/**
 * TESTS
 * Run mocha tests
 */
gulp.task('test', function () {
    var reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) { shell.mkdir('-p', reportsDir); }

    return gulp.src('src/**/*.test.js', { read: false })
        .pipe(mocha({
            reporter: 'mocha-junit-reporter',
            reporterOptions: { mochaFile: 'reports/unit-tests-junit.xml' }
        }));
});

gulp.task('tdd', function () {
    gulp.watch(['src/**/*.js'], batch(function () {
        return gulp.src(['src/**/*.spec.js'])
            .pipe(mocha({ reporter: 'list' }))
            .on('error', function (err) {
                console.log(err.stack);
            });
    }));
});


/**
 * CSS Lint
 */
gulp.task('csslint', function () {
    var ignoreVendorStyles = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });
    var output = '';

    return gulp.src('src/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(ignoreVendorStyles)
        .pipe(csslint())
        .pipe(csslint.reporter('junit-xml', {
            logger: function (str) {
                var reportsDir = 'reports';
                if (!fs.existsSync(reportsDir)) { shell.mkdir('-p', reportsDir); }

                output += str;
                fs.writeFile(reportsDir + '/csslint-junit.xml', output);
            }
        }));
});

gulp.task('csslint-cli', function () {
    var ignoreVendorStyles = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });

    return gulp.src('src/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(ignoreVendorStyles)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});


/**
 * ESLINT
 */
gulp.task('eslint', function () {
    var reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) {
        shell.mkdir('-p', reportsDir);
    }

    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format('checkstyle', fs.createWriteStream(path.join(__dirname, '/reports/eslint-checkstyle.xml'))))
        .pipe(eslint.failAfterError());
});

gulp.task('eslint-cli', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format('compact'))
        .pipe(eslint.failAfterError());
});


/**
 * ADD-GIT-HOOKS
 */
gulp.task('add-git-hooks', function () {
    return gulp.src('./hooks/*')
        .pipe(gulpCopy('./.git/'));
});
