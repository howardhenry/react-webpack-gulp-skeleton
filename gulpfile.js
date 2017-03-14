const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const eslint = require('gulp-eslint');
const csslint = require('gulp-csslint');
const filter = require('gulp-filter');
const mocha = require('gulp-mocha');
const batch = require('gulp-batch');
const gulpUtil = require('gulp-util');
const autoprefixer = require('autoprefixer');
const shell = require('shelljs');
const webpack = require('webpack');
const _ = require('lodash');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config.js');

/**
 * SASS-DEV
 * compile sass in 'src' directory and save in place to .css
 */
gulp.task('sass-dev', () => {
    return gulp.src(['./src/**/*.scss'])
        .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(gulp.dest('./src/theme/css'));
});

/**
 * WEBPACK-DEV
 * Bundle and serve app with webpack or port 8080
 */
gulp.task('webpack-dev-server', () => {
    const port = 8080;
    const config = Object.create(webpackConfig);
    config.devtool = 'eval';
    config.debug = true;

    _.forEach(config.entry, (entry, key) => {
        config.entry[key].unshift('webpack/hot/only-dev-server');
        config.entry[key].unshift(`webpack-dev-server/client?http://localhost:${port}/`);
    });

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(config), {
        contentBase: path.join(__dirname, '/src/'),
        publicPath: config.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(port, 'localhost', (err) => {
        if (err) { throw new gulpUtil.PluginError('webpack-dev-server', err); }
        gulpUtil.log('[webpack-dev-server]', 'http://localhost:8080/webpack-dev-server/index.html');
    });

    gulp.watch(['./src/**/*.scss'], ['sass-css']);
});

/**
 * TESTS
 * Run mocha tests
 */
gulp.task('test', () => {
    const reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) { shell.mkdir('-p', reportsDir); }

    return gulp.src('src/**/*.test.js', { read: false })
        .pipe(mocha({
            reporter: 'mocha-junit-reporter',
            reporterOptions: { mochaFile: 'reports/unit-tests-junit.xml' }
        }));
});

gulp.task('tdd', () => {
    gulp.watch(['src/**/*.js'], batch(() => {
        return gulp.src(['src/**/*.spec.js'])
            .pipe(mocha({ reporter: 'list' }))
            .on('error', (err) => {
                console.log(err.stack); // eslint-disable-line no-console
            });
    }));
});

/**
 * CSS Lint
 */
gulp.task('csslint', () => {
    const ignoreVendorStyles = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });
    let output = '';

    return gulp.src('src/**/*.scss')
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: ['last 4 versions'] })]))
        .pipe(ignoreVendorStyles)
        .pipe(csslint())
        .pipe(csslint.reporter('junit-xml', {
            logger: (str) => {
                const reportsDir = 'reports';
                if (!fs.existsSync(reportsDir)) { shell.mkdir('-p', reportsDir); }

                output += str;
                fs.writeFile(`${reportsDir}/csslint-junit.xml`, output);
            }
        }));
});

gulp.task('csslint-cli', () => {
    const ignoreVendorStyles = filter(['**/*.css', '!**/bootstrap.css'], { restore: true });

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
gulp.task('eslint', () => {
    const reportsDir = 'reports';
    if (!fs.existsSync(reportsDir)) {
        shell.mkdir('-p', reportsDir);
    }

    return gulp.src(['./src/**/*.js', './src/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format('checkstyle', fs.createWriteStream(path.join(__dirname, '/reports/eslint-checkstyle.xml'))))
        .pipe(eslint.failAfterError());
});

gulp.task('eslint-cli', () => {
    return gulp.src(['./gulpfile.js', './src/**/*.js', './src/**/*.jsx'])
        .pipe(eslint())
        .pipe(eslint.format('compact'))
        .pipe(eslint.failAfterError());
});
