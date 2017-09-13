var gulp = require('gulp');

gulp.task('default', function() {
    gulp.src(['thorax.js'])
        .pipe(gulp.dest('build'));
});