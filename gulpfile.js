var gulp = require('gulp');
var uglify = require('gulp-uglify');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var shell = require('gulp-shell');
var rename = require('gulp-rename');
var pkg = require('./package.json');
var banner = '/*! <%= name %> // @version <%= version %>, @license <%= license %>, @author <%= author %> */\n';

var SRC_FILES = 'src/**/*.js';

gulp.task('lint', function() {
    gulp.src(SRC_FILES)
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish));
});

gulp.task('dest', function() {
    gulp.src(SRC_FILES)
        .pipe(uglify({ outSourceMap: true }))
        .pipe(header(banner, pkg))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('test', shell.task([
    'karma start'
]));

gulp.task('release', ['lint', 'test', 'dest']);

gulp.task('default', ['lint', 'test']);
