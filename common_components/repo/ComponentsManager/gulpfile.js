var gulp = require('gulp');

gulp.task('default', function() {
    return gulp.src('componentsManager.js')
        .pipe(gulp.dest('build'));
});