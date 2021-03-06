var gulp = require('gulp');
var del = require('del');

// Load all gulp plugins automatically
// and attach them to the `plugins` object
var plugins = require('gulp-load-plugins')();

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('clean', function (done) {
    del.sync([dirs.dist]);
    done();
});

gulp.task('copy:vendor', function (done) {
    gulp.src([
        'node_modules/angular/angular.min.js',
        'node_modules/angular-route/angular-route.min.js'
    ])
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js'));

    gulp.src([
        'node_modules/angular/angular.min.js.map',
        'node_modules/angular-route/angular-route.min.js.map'
    ])
        .pipe(gulp.dest(dirs.dist + '/js'));

    gulp.src([
        'node_modules/normalize.css/normalize.css'
    ])
        .pipe(plugins.concatCss('vendor.css'))
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename('vendor.min.css'))
        .pipe(gulp.dest(dirs.dist + '/css'));

    done();
});

gulp.task('copy:misc', function (done) {
    gulp.src('LICENSE.txt')
        .pipe(gulp.dest(dirs.dist));

    gulp.src([
        // Copy all files
        dirs.src + '/**/*',

        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/*',
        '!' + dirs.src + '/js/*',
        '!' + dirs.src + '/doc/*',
        '!' + dirs.src + '/.gitignore',
        '!' + dirs.src + '/.gitattributes'
    ], {

        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));

    done();
});

gulp.task('copy:html', function (done) {
    del.sync([dirs.dist + '/views/*']);
    gulp.src([dirs.src + '/views/**/*.html'])
        .pipe(gulp.dest(dirs.dist + '/views'))
        .pipe(plugins.connect.reload());
    done();
});

gulp.task('copy', gulp.series(
    'copy:vendor',
    'copy:misc'
));

gulp.task('bundle:css', function (done) {
    del([dirs.dist + '/css/bundle.min.css']);
    gulp.src([dirs.src + '/css/base.scss'])
        .pipe(plugins.dartSass())
        .pipe(plugins.autoprefixer({ cascade: false }))
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename('bundle.min.css'))
        .pipe(gulp.dest(dirs.dist + '/css'))
        .pipe(plugins.connect.reload());
    done();
});

gulp.task('bundle:js', function (done) {
    del([dirs.dist + '/js/app.min.js']);
    gulp.src([dirs.src + '/js/**/*.js'])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('app.min.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(dirs.dist + '/js'))
        .pipe(plugins.connect.reload());
    done();
});

gulp.task('bundle', gulp.series(
    'bundle:css',
    'bundle:js'
));

gulp.task('watch', function () {
    gulp.watch(dirs.src + '/js/*.js', ['bundle']);
    gulp.watch(dirs.src + '/css/*.scss', ['bundle']);
    gulp.watch(dirs.src + '/views/**/*.html', ['copy:html']);
});

gulp.task('connect', function (done) {
    plugins.connect.server({
        root: 'dist',
        livereload: true
    });
    done();
});

gulp.task('watch', function () {
    gulp.watch(dirs.src + '/js/*.js', ['bundle']);
    gulp.watch(dirs.src + '/css/*.scss', ['bundle']);
    gulp.watch(dirs.src + '/views/**/*.html', ['copy:html']);
});

gulp.task('connect', function () {
    plugins.connect.server({
        root: 'dist',
        livereload: true
    });
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('build', gulp.series(
    'clean',
    gulp.series('copy', 'bundle')
));

gulp.task('start-server', gulp.series(
    gulp.series('connect', 'clean'),
    gulp.series('copy', 'bundle'),
    'watch'
));
