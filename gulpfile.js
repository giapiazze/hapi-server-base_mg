const Gulp = require('gulp');

Gulp.paths = {
	src: './'
};

require('require-dir')('./db/seeds');

Gulp.task('default', [], function () {
});