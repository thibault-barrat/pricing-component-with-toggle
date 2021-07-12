// Load plugins
var gulp = require( 'gulp' );
var plumber = require( 'gulp-plumber' );
var sass = require( 'gulp-sass' )(require('sass'));
var rename = require( 'gulp-rename' );
var concat = require( 'gulp-concat' );
var uglify = require( 'gulp-uglify' );
var imagemin = require( 'gulp-imagemin' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browsersync = require( 'browser-sync' ).create();
var del = require( 'del' );
var cleanCSS = require( 'gulp-clean-css' );
var autoprefixer = require( 'gulp-autoprefixer' );

// Configuration file to keep your code DRY
var cfg = require( './gulpconfig.json' );
var paths = cfg.paths;

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: cfg.paths.dist
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Optimize Images
function images() {
  return gulp
    .src(`${paths.imgsrc}/**`)
    .pipe( imagemin() )
    .pipe(gulp.dest(paths.img));
}

// Compiles SCSS files in CSS
function sasscompile() {
  return gulp
      .src( `${paths.sass}/style.scss` )
      .pipe( sourcemaps.init( { loadMaps: true } ) )
      .pipe( plumber( {
          errorHandler: function( err ) {
              console.log( err );
              this.emit( 'end' );
          }
      } ) )
      .pipe( sass( { errLogToConsole: true } ) )
      .pipe( autoprefixer( 'last 2 versions' ) )
      .pipe( sourcemaps.write( './' ) )
      .pipe( gulp.dest( paths.css ) )
}

// Minifies CSS files
function minifycss() {
  return gulp.src( paths.css + '/style.css' )
  .pipe( sourcemaps.init( { loadMaps: true } ) )
    .pipe( cleanCSS( { compatibility: '*' } ) )
    .pipe( plumber( {
            errorHandler: function( err ) {
                console.log( err ) ;
                this.emit( 'end' );
            }
        } ) )
    .pipe( rename( { suffix: '.min' } ) )
     .pipe( sourcemaps.write( './' ) )
    .pipe( gulp.dest( paths.css ) );
}

const styles = gulp.series(sasscompile, minifycss);
/* function styles() {
  gulp.series(sass, minifycss);
} */

// Uglifies and concat all JS files into one
function scripts() {
  gulp.src( `${paths.dev}/js/*.js`, { allowEmpty: true })
    .pipe( concat( 'main.min.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( paths.js ) );

  return gulp.src( `${paths.dev}/js/*.js`, { allowEmpty: true } )
    .pipe( concat( 'main.js' ) )
    .pipe( gulp.dest( paths.js ) );
}

// Deleting any file inside the /dist folder
function cleandist() {
  return del( [`${paths.dist}/**`] );
}

// Copies the files to the /dist folder
function dist() {
  gulp.series(cleandist);
  const ignore = [`!${paths.node}`, `!${paths.node}/**`, `!${paths.dev}`, `!${paths.dev}/**`, `!${paths.dist}`, `!${paths.dist}/**`, `!${paths.sass}`, `!${paths.sass}/**`, '!./design', '!./design/**', '!readme.txt', '!README.md', '!README-template.md', '!style-guide.md', '!package.json', '!package-lock.json', '!gulpfile.js', '!gulpconfig.json', '!CHANGELOG.md', '!.travis.yml', '!jshintignore',  '!codesniffer.ruleset.xml', '!_README.md', '!composer.json', '!gulpconfig.json' ];
  console.log({ ignore })

  return gulp.src( ['**/*', ...ignore], { 'buffer': false } )
    .pipe( gulp.dest( paths.dist ) );
}


// Watch files
function watchFiles() {
  gulp.watch(`${paths.sass}/**/*.scss`, gulp.series(styles, dist, browserSyncReload));
  gulp.watch(`${paths.dev}/js/**/*.js`, gulp.series(scripts, dist, browserSyncReload));
  gulp.watch(`${paths.imgsrc} /**`, gulp.series(images, dist, browserSyncReload));
  gulp.watch( '*.html', gulp.series(dist, browserSyncReload));
}

// define complex tasks
const build = gulp.series( gulp.parallel(styles, images, scripts), dist);
const watch = gulp.parallel(watchFiles, browserSync);

// export tasks
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.dist = dist;
exports.build = build;
exports.watch = watch;
exports.default = build;


