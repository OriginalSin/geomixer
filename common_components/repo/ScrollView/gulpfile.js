var gulp = require('gulp');
var concat = require('gulp-concat');
var streamqueue = require('streamqueue');

var styles = ['jquery.jscrollpane.css'];
var scripts = ['jquery.mousewheel.js', 'jquery.jscrollpane.js', 'ScrollView.js'];

gulp.task('default', function() {
    var sourcesStream = gulp.src(scripts)
        .pipe(concat('scrollView.js'));
    var cssStream = gulp.src(styles)

    var finalStream = streamqueue({
            objectMode: true
        }, sourcesStream, cssStream)
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    console.log([].concat(styles, scripts));
    gulp.watch([].concat(styles, scripts), ['default']);
});