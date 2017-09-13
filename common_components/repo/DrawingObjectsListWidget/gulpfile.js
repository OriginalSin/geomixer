var gulp = require('gulp');
var html2jsobject = require('gulp-html2jsobject');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var rename = require('gulp-rename');
var streamqueue = require('streamqueue');

// сорбирать надо в строгой последовательности, чтобы объявить шаблоны
// до выполнения скрипта

var styles = ['drawingObjectsListWidget.css'];
var scripts = ['DrawingObjectsListWidget.js', 'Translations.js'];
var templates = ['listTemplate.html', 'nodeTemplate.html', 'emptyTemplate.html'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var templatesStream = gulp.src(templates)
        .pipe(html2jsobject('nsGmx.Templates.DrawingObjectsListWidget'))
        .pipe(concat('templates.js'))
        .pipe(header('nsGmx.Templates.DrawingObjectsListWidget = {};\n'))
        .pipe(header('nsGmx.Templates = nsGmx.Templates || {};'))
        .pipe(header('var nsGmx = window.nsGmx = window.nsGmx || {};'));

    var cssStream = gulp.src(styles)

    var jsStream = streamqueue({
            objectMode: true
        }, templatesStream, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('drawingObjectsListWidget.js'));

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});