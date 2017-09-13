var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var footer = require('gulp-footer');
var streamqueue = require('streamqueue');
var html2jsobject = require('gulp-html2jsobject');

var styles = ['timeline.css', 'gmxTimelineControl.css'];
var scripts = ['timeline.js', 'LineItem.js', 'gmxTimelineControl.js'];
var images = [];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts);

    var cssStream = gulp.src(styles)

    var jsStream = streamqueue({
            objectMode: true
        }, sourcesStream)
        .pipe(footer(';'))
        .pipe(concat('Timeline.js'));

    var imgStream = gulp.src(images);

    var finalStream = streamqueue({
            objectMode: true
        }, jsStream, cssStream, imgStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts, templates));
    gulp.watch([].concat(styles, scripts, templates), ['default']);
});