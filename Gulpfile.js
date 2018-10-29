'use strict';

// Core references for this to work
var gulp = require( 'gulp' ),
	sass = require( 'gulp-sass' ),
	browserSync = require( 'browser-sync' ).create(),
	useref = require( 'gulp-useref' ),
	uglify = require( 'gulp-uglify' ),
	gulpIf = require( 'gulp-if' ),
	clean = require( 'gulp-clean' ),
	cssnano = require( 'gulp-cssnano' ),
	sourcemaps = require( 'gulp-sourcemaps' ),
	imagemin = require( 'gulp-imagemin' ),
	cache = require( 'gulp-cache' ),
	del = require( 'del' ),
	runSequence = require( 'run-sequence' );
// reload = browserSync.reload;

// Basic Gulp task syntax
gulp.task( 'hello', function () {
	console.log( 'Hello World!' );
} )

// Development Tasks
// -----------------

// ###############################################
// var listing of files for dist build
var filesToDist = [
  './src/*.html',
  './src/assets/styles/**/*.*',
  './src/assets/img/**/*.*',
  './src/assets/js/**/*.js'
];
// ###############################################

// Start browserSync server
gulp.task( 'browserSync', function () {
	browserSync.init( {
		server: {
			baseDir: './src/'
		},
	} )
} )

// ###############################################
// Use for stand-alone autoprefixer
var gulpautoprefixer = require( 'gulp-autoprefixer' );
//
// // alternate vars if you want to use Postcss as a setup
// var postcss = require('gulp-postcss'),
//     autoprefixer = require('autoprefixer');
// ###############################################

gulp.task( 'sass', function () {
	return gulp.src( './src/assets/styles/sass/{,*/}*.{scss,sass}' ) // Gets all files ending with .scss in ./src/assets/scss and children dirs
		.pipe( sass().on( 'error', sass.logError ) ) // Passes it through a gulp-sass, log errors to console
		.pipe( gulp.dest( './src/assets/styles' ) ) // Outputs it in the css folder
		.pipe( browserSync.reload( { // Reloading with Browser Sync
			stream: true
		} ) );
} )


// ###############################################
// Gulp task when using gulp-autoprefixer as a standalone process
// gulp.task('build:css', function() {
//     gulp.src('./src/assets/sass/{,*/}*.{scss,sass}')
//         .pipe(sourcemaps.init())
//         .pipe(sass({
//         errLogToConsole: true,
//         outputStyle: 'expanded' //alt options: nested, compact, compressed
//     }))
//         .pipe(gulpautoprefixer({
//         browsers: ['last 4 versions'],
//         cascade: false
//     }))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('./src/assets/styles'))
//         .pipe(reload({stream: true}));
// });
// ###############################################


// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task( 'useref', function () {

	return gulp.src( './src/*.html' )
		.pipe( useref() )
		.pipe( gulpIf( '*.js', uglify() ) )
		.pipe( gulpIf( '*.css', cssnano() ) )
		.pipe( gulp.dest( 'dist' ) );
} );

// Optimizing img
gulp.task( 'img', function () {
	return gulp.src( './src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)' )
		// Caching img that ran through imagemin
		.pipe( cache( imagemin( {
			interlaced: true,
		} ) ) )
		.pipe( gulp.dest( 'dist/img' ) )
} );

// Copying fonts
gulp.task( 'fonts', function () {
	return gulp.src( './src/assets/fonts/**/*' )
		.pipe( gulp.dest( 'dist/fonts' ) )
} )

// ###############################################
// Static Server + watching scss/html files
// gulp.task('serve', ['build:css'], function() {
//
//     browserSync.init({
//         server: "./src/assets/",
//         port: 8080
//     });
//
//     gulp.watch('./src/assets/sass/{,*/}*.{scss,sass}', ['build:css']);
//     gulp.watch("./src/assets/*.html").on('change', browserSync.reload);
// });
//
// // Sass watcher
// gulp.task('sass:watch', function() {
//     gulp.watch('./src/assets/sass/{,*/}*.{scss,sass}', ['build:css'])
// });
//
// // resource cleaning task
// gulp.task('clean', function(){
//   return gulp.src(['dist/*'], {read:false})
//   .pipe(clean());
// });
// ###############################################

// Cleaning
gulp.task( 'clean', function () {
	return del.sync( 'dist' ).then( function ( cb ) {
		return cache.clearAll( cb );
	} );
} )

gulp.task( 'clean:dist', function () {
	return del.sync( [ 'dist/**/*', '!dist/img', '!dist/img/**/*' ] );
} );

// Watchers
// gulp.task('watch', function() {
//   gulp.watch('./src/assets/styles/sass/**/*.scss', ['sass']);
//   gulp.watch('./src/*.html', browserSync.reload);
//   gulp.watch('./src/assets/js/**/*.js', browserSync.reload);
// })

gulp.task( 'watch', [ 'browserSync', 'sass' ], function () {
	gulp.watch( './src/assets/styles/sass/**/*.scss', [ 'sass' ] );
	// Reloads the browser whenever HTML or JS files change
	gulp.watch( './src/*.html', browserSync.reload );
	gulp.watch( './src/assets/js/**/*.js', browserSync.reload );
} );

// Build Sequences
// ---------------

gulp.task( 'default', function ( callback ) {
	runSequence( [ 'sass', 'browserSync' ], 'watch',
		callback
	)
} )

gulp.task( 'build', function ( callback ) {
	runSequence(
		'clean:dist',
		'sass',
    [ 'useref', 'img', 'fonts' ],
		callback
	)
} )

// ###############################################
// dist build tasks
// see var filesToDist for specific files
// gulp.task('build:dist',['clean'], function(){
//   // the base option sets the relative root for the set of files,
//   // preserving the folder structure
//   gulp.src(filesToDist, { base: './src/assets/' })
//   .pipe(gulp.dest('dist'));
// });
//
// gulp.task('default', ['build:css', '' 'serve']);
// ###############################################
