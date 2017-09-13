var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var streamqueue = require('streamqueue');
var html2jsobject = require('gulp-html2jsobject');

var styles = ['slideGalleryWidget.css'];
var scripts = ['SlideGalleryWidget.js'];
var templates = ['slideGalleryWidget.html'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var templatesStream = gulp.src(templates)
        .pipe(html2jsobject('nsGmx.Templates.SlideGalleryWidget'))
        .pipe(concat('templates.js'))
        .pipe(header('nsGmx.Templates.SlideGalleryWidget = {};\n'))
        .pipe(header('nsGmx.Templates = nsGmx.Templates || {};'))
        .pipe(header('var nsGmx = window.nsGmx = window.nsGmx || {};'));

    var cssStream = gulp.src(styles)

    var jsStream = streamqueue({
            objectMode: true
        }, templatesStream, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('slideGalleryWidget.js'));

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});