const syntax        = 'sass'; // Syntax: sass or scss;

const gulp 					= require('gulp');
const sass          = require('gulp-sass');
const browserSync   = require('browser-sync');
const concat        = require('gulp-concat');
const cleancss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const autoprefixer  = require('gulp-autoprefixer');
const notify        = require("gulp-notify");
const rsync         = require('gulp-rsync');
const babel         = require('gulp-babel');
const pug 					= require('gulp-pug');
const gulpif 				= require('gulp-if');
const emitty 				= require('emitty').setup('app/pug', 'pug');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

gulp.task('templates', () =>
	new Promise((resolve, reject) => {
		emitty.scan(global.emittyChangedFile).then(() => {
			gulp.src('app/pug/*.pug')
				.pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
				.pipe(pug({ pretty: true }).on("error", notify.onError()))
				.pipe(gulp.dest('app/'))
				.on('end', resolve)
				.on('error', reject)
				.pipe(browserSync.reload({ stream: true }));				
		});
	})
);

gulp.task('styles', function() {
	return gulp.src('app/'+syntax+'/**/*.'+syntax+'')
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('scripts', function() {
	return gulp.src([
		'app/js/common.js'
	])
	.pipe(concat('scripts.min.js'))
	.pipe(babel({
		presets: ['@babel/env']
	}))
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({ stream: true }))
});

gulp.task('rsync', function() {
	return gulp.src('app/**')
	.pipe(rsync({
		root: 'app/',
		hostname: 'axe-vota@axe-vota.myjino.ru',
		destination: 'domains/temp.alldan.ru/wor/lk/',
		// include: ['*.htaccess'], // Includes files to deploy
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', function() {
	// Shows that run "watch" mode
	global.watch = true;

	gulp.watch('app/'+syntax+'/**/*.'+syntax+'', gulp.parallel('styles'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
	gulp.watch('app/pug/**/*.pug', gulp.series('templates'))
		.on('all', (event, filepath) => {
			global.emittyChangedFile = filepath;
		});
});

gulp.task('default', gulp.parallel('templates', 'styles', 'scripts', 'browser-sync', 'watch'));