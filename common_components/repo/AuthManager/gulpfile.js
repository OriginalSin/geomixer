var gulp = require('gulp');
var concat = require('gulp-concat');

var files = ['Server.js', 'ResourceServer.js', 'AuthManager.js', 'api.js'];

gulp.task('default', function() {
    gulp.src(files)
        .pipe(concat('authManager.js'))
        .pipe(gulp.dest('build'));
});

gulp.task('test', function() {
    gulp.src(files)
        .pipe(concat('authManager.js'))
        .pipe(gulp.dest('oAuthClient'));
});