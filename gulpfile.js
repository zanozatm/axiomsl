'use strict';
const 	gulp 		 = require('gulp'),
		sass		 = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		cleanCss	 = require('gulp-clean-css'),
		gcmq 		 = require('gulp-group-css-media-queries'),
		pug 		 = require('gulp-pug'),
		prettyHtml   = require('gulp-pretty-html'),
		imagemin 	 = require('gulp-imagemin'),
		newer 		 = require('gulp-newer'),
		rename 		 = require('gulp-rename'),
		del 		 = require('del'),
		postcss 	 = require('gulp-postcss'),
		plumber 	 = require('gulp-plumber'),
		notify 		 = require('gulp-notify'),
		browserSync	 = require('browser-sync').create();

const	path 		 = {

		public: {
			html: 'public',
			js	: 'public/js',
			css : 'public/css',
			img : 'public/img'		
		},

		src: {
			pug  : 'src/**/*.pug', 
			js	 : 'src/js/**/*.js',
			css  : 'src/css/**/*.sass',
			img  : 'src/img/**/*'
		},

		watch: {
			pug  : 'src/**/*.pug', 
			js	 : 'src/js/**/*.js',
			css  : 'src/css/**/*.sass',
			img  : 'src/img/**/*'
		}
	};


// BrowserSync
function webserver(done) {
  browserSync.init({
    server: {
      baseDir: "./public"
    },
    host: 'localhost',
    port: 3000
  });
  done();
}
// BrowserSync Reload
function reload(done) {
  browserSync.reload();
  done();
}

function clean() {
	return del(path.public.html);
}

// Optimize Images
function images() {
  return gulp
    .src(path.src.img)
    .pipe(newer(path.public.img))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(path.public.img));
}
// html task
function html() {
	return gulp
		.src(path.src.pug)
		.pipe(plumber({
	          errorHandler: notify.onError()
	   }))
		.pipe(pug({
		    pretty: true
		}))
		.pipe(gulp.dest(path.public.html))
		.pipe(prettyHtml());
}
// CSS task
function css() {
  return gulp
    .src(path.src.css)
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }).on('error', sass.logError))
    .pipe(gulp.dest(path.public.css))
    .pipe(rename({ suffix: ".min" }))
    .pipe(autoprefixer(['last 3 versions', '> 1%'], { cascade: true }))
    .pipe(cleanCss())
    .pipe(gulp.dest(path.public.css));
}
// js task
function scripts() {
  return (
    gulp
      .src(path.src.js)
      .pipe(plumber({
	          errorHandler: notify.onError()
	   }))
      .pipe(gulp.dest(path.public.js))
  );
}
// Watch files
function watchFiles() {
  gulp.watch(path.watch.css, css).on('change', browserSync.reload);
  gulp.watch(path.watch.js, scripts).on('change', browserSync.reload);
  gulp.watch(path.watch.img, images);
  gulp.watch(path.watch.pug, html ).on('change', browserSync.reload);
}

exports.clean = clean;
exports.images = images;
exports.css = css;
exports.scripts = scripts;
// define complex tasks
const build = gulp.series(clean, gulp.parallel(css, images, scripts, html));
const watch = gulp.parallel(watchFiles, webserver);

exports.build = build;
exports.watch = watch;
exports.default = gulp.series(
    build,
    watch
);