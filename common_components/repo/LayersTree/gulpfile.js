var gulp = require('gulp');

gulp.task('default', function() {
    gulp
        .src('LayersTree.js')
        .pipe(gulp.dest('build'));
});