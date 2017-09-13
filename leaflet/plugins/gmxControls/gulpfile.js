var gulp = require('gulp'),
	concat = require('gulp-concat'),
	minify = require('gulp-minify'),
	eslint = require('gulp-eslint'),
	svgSymbols = require('gulp-svg-symbols'),
	cheerio = require('gulp-cheerio'),
	fs = require('fs'),
	deps = require('./build/deps.js'),
	depsJS = deps.depsJS,
	depsCSS = deps.depsCSS;

var name = 'gmxControls';
var dist = 'dist';

gulp.task('jsmin', ['lint'], function () {
	gulp.src(depsJS)
		.pipe(concat(name + '.js'))
		.pipe(minify({ext:{src: '-src.js'}}))
		.pipe(gulp.dest(dist))
});
gulp.task('cssmin', function () {
	return gulp.src(depsCSS)
		.pipe(concat(name + '.css'))
		.pipe(gulp.dest(dist + '/css'))
});
gulp.task('imgcopy', function () {
	return gulp.src('src/css/img/*.*')
		.pipe(gulp.dest(dist + '/css/img'))
});

gulp.task('lint', function () {
  return gulp.src(depsJS)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
gulp.task('sprites', function () {
  return gulp.src('src/css/svgIcons/*.svg')
    .pipe(svgSymbols({
			templates: ['default-svg']
		}))
		.pipe(cheerio(function ($, file) {
			['path', 'polygon', 'circle', 'rect', 'ellipse'].map(function (shape) {
					$(shape).removeAttr('fill');
					$(shape).removeAttr('class');
			});
    }))
		.pipe(gulp.dest('src/css/img'))
		.pipe(gulp.dest(dist + '/css/img'));
});
gulp.task('svgCheck', ['sprites'], function() {
	var str = fs.readFileSync('examples/svgIcons.tmp.html', 'utf8'),
		svg = fs.readFileSync(dist + '/css/img/svg-symbols.svg', 'utf8');
    str = str.replace(/<svg\/>/, svg);
	fs.writeFileSync('examples/svgIcons.html', str);
});
gulp.task('default', ['jsmin', 'cssmin', 'imgcopy']);
