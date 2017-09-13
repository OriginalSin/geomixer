var gulp = require('gulp');
var html2jsobject = require('gulp-html2jsobject');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var streamqueue = require('streamqueue');

var styles = [
    'layersTreeWidget.css'
];

var scripts = [
    'LayersTreeWidget.js',
    'NodeView.js',
    'ContentView.js',
    'LayerView.js',
    'GroupView.js'
];

var templates = [
    'contentView.html'
];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var templatesStream = gulp.src(templates)
        .pipe(html2jsobject('window.nsGmx.Templates.LayersTreeWidget'))
        .pipe(concat('templates.js'))
        .pipe(header('window.nsGmx.Templates.LayersTreeWidget = {};\n'))
        .pipe(header('window.nsGmx.Templates = window.nsGmx.Templates || {};'))
        .pipe(header('window.nsGmx = nsGmx || {};'));

    var cssStream = gulp.src(styles)

    var jsStream = streamqueue({
            objectMode: true
        }, templatesStream, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('layersTreeWidget.js'));

    return streamqueue({
            objectMode: true
        }, jsStream, cssStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});
