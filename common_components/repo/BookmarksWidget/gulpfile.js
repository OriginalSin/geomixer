var gulp = require('gulp');
var html2jsobject = require('gulp-html2jsobject');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var rename = require('gulp-rename');
var streamqueue = require('streamqueue');

// сорбирать надо в строгой последовательности, чтобы объявить шаблоны
// до выполнения скрипта

var styles = ['bookmarksWidget.css'];
var scripts = ['bookmarksWidget.js'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var cssStream = gulp.src(styles)

    var jsStream = streamqueue({
            objectMode: true
        }, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('bookmarksWidget.js'));

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});