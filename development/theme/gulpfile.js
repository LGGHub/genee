var gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    terser = require('gulp-terser'),
    cleanCSS = require('gulp-clean-css'),
    postcss = require('gulp-postcss'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    autoprefixer = require('autoprefixer'),
    fileinclude = require('gulp-file-include'),
    imagemin = require('gulp-imagemin'),
    del = require('del'),
    babel = require('gulp-babel');

var browserSync = require('browser-sync').create()


//
// Compile and minify SCSS files (Bootstrap is included).
//

function css() {
  return gulp.src('src/assets/scss/theme.scss')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS())
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/assets/css'))
    .pipe(browserSync.stream({match: '**/*.css'}))
}


//
// Compile SCSS files in an expanded output.
// Useful if you want to work directly with theme.css
//

function cssExpanded() {
  return gulp.src('src/assets/scss/theme.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('dist/assets/css'))
}


// 
// Compile vendor CSS files into vendor.min.css
// 

function cssVendor() {
  return gulp.src('src/assets/vendor/**/*.css')
    .pipe(concat('vendor.css'))
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/assets/css'))
}


//
// Minify main theme.js file.
//

function js() {
  return gulp.src('src/assets/js/theme.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(terser())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/assets/js'))
    .pipe(browserSync.stream())
}


//
// Move theme.js into /dist.
// Useful if you want to work directly with it.
//

function jsExpanded() {
  return gulp.src('src/assets/js/theme.js')
        .pipe(gulp.dest('dist/assets/js'))
}


// 
// Compile vendor JS files into vendor.min.js
// 

function jsVendor() {
  return gulp.src([
      'src/assets/vendor/jquery/dist/jquery.min.js',
      'src/assets/vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
      'src/assets/vendor/moment/moment.min.js',
      'src/assets/vendor/**/*.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(terser())
    .pipe(gulp.dest('dist/assets/js'))
}


//
// Compile HTML partials.
//

function partials() {
  del.sync(['dist/**/*.html'])

  return gulp.src([
      'src/**/*.html',
      '!src/partials/**/*.html'
    ])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true,
      context: {
        classList: "",
        styleList: ""
      }
    }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream())
}


//
// Move fonts, images and vendor plugins to /dist.
//

function fonts() {
  del.sync(['dist/assets/fonts/**/*'])

  return gulp.src('src/assets/fonts/**/*.*')
        .pipe(gulp.dest('dist/assets/fonts'))
        .pipe(browserSync.stream())
}

function images() {
  del.sync(['dist/assets/img/**/*'])

  return gulp.src('src/assets/img/**/*.*')
        .pipe(gulp.dest('dist/assets/img'))
        .pipe(browserSync.stream())
}

function vendor() {
  del.sync(['dist/assets/vendor/**/*'])

  return gulp.src('src/assets/vendor/**/*.*')
        .pipe(gulp.dest('dist/assets/vendor'))
        .pipe(browserSync.stream())
}


//
// Start up a browser tab that automatically refreshes when changes are made.
//

function browser() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })

  gulp.watch('src/assets/scss/**/*.scss', gulp.parallel(css, cssExpanded))
  gulp.watch('src/assets/js/**/*.js', gulp.parallel(js, jsExpanded))
  gulp.watch('src/assets/img/**/*', images)
  gulp.watch('src/assets/fonts/**/*', fonts)
  gulp.watch('src/assets/vendor/**/*', vendor)
  gulp.watch('src/**/*.html', partials)
}


//
// Gulp tasks
//

exports.minifyVendor = gulp.parallel(cssVendor, jsVendor)

exports.build = gulp.series(css, cssExpanded, js, jsExpanded, partials, fonts, images, vendor)
exports.default = gulp.series(css, cssExpanded, js, jsExpanded, partials, fonts, images, vendor, browser)
