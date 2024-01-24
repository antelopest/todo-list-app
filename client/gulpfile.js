'use strict';

import gulp from 'gulp';
import browsersync from 'browser-sync';
const browserSync = browsersync.create();
import htmlMin from 'gulp-htmlmin';
import clean from 'gulp-clean';
import gulpSass from 'gulp-sass';
import dartSass from 'sass';
const sass = gulpSass(dartSass);
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import cssnano from 'gulp-cssnano';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import imagemin from 'gulp-imagemin';
import changed from 'gulp-changed';

const directories = {
    src: 'src',
    build: 'dist'
}

const path = {
    html: {
        src: `${directories.src}/**/*.html`,
        output: `${directories.build}/`
    },
    styles: {
        src: `${directories.src}/styles/**/*.sass`,
        output: `${directories.build}/`
    },
    scripts: {
        src: `${directories.src}/**/*.js`,
        output: `${directories.build}/`
    },
    images: {
        src: `${directories.src}/images/*`,
        output: `${directories.build}/images/`
    },
    fonts: {
        src: `${directories.src}/fonts/*`,
        output: `${directories.build}/fonts/`
    }
}
gulp.task("clean", function () {
     return gulp.src(directories.build, { allowEmpty: true })
         .pipe(clean());
});
gulp.task("server:init", function (done) {
    browserSync.init({
        server: {
            baseDir: `${directories.build}/`
        },
        host: 'localhost',
        port: '3000',
        notify: false,
        online: true
    });

    done();
});

gulp.task("reload", function (done) {
    browserSync.reload();

    done();
});


gulp.task("html:build", function () {
    return gulp.src(path.html.src)
        .pipe(htmlMin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(path.html.output))
        .pipe(browserSync.stream());
});
gulp.task("css:build", function () {
    return gulp.src(path.styles.src)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(autoprefixer({overrideBrowserslist: ['last 4 version'], cascade: false}))
        .pipe(rename({suffix: '.min', extname: '.css'}))
        .pipe(cssnano())
        .pipe(gulp.dest(path.styles.output))
        .pipe(browserSync.stream());
});
gulp.task("js:build", function () {
    return gulp.src(path.scripts.src)
        .pipe(changed(path.scripts.src))
        .pipe(concat('main.bundle.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min', extname: '.js'}))
        .pipe(gulp.dest(path.scripts.output))
        .pipe(browserSync.stream());
});

gulp.task("images:build", function () {
    return gulp.src(path.images.src)
        .pipe(imagemin())
        .pipe(gulp.dest(path.images.output))
        .pipe(browserSync.stream());
});

gulp.task("fonts:build", function () {
   return gulp.src(path.fonts.src)
       .pipe(gulp.dest(path.fonts.output))
       .pipe(browserSync.stream());
});

gulp.task("watch", function () {
    gulp.watch(path.fonts.src, gulp.series("fonts:build", "reload"));
    gulp.watch(path.images.src, gulp.series("images:build", "reload"));
    gulp.watch(path.scripts.src, gulp.series("js:build", "reload"));
    gulp.watch(path.styles.src, gulp.series("css:build", "reload"));
    gulp.watch(path.html.src, gulp.series("html:build", "reload"));
});

const build = ["fonts:build", "js:build", "css:build", "html:build", "images:build"];
const watch = gulp.parallel("server:init", "watch");
export default gulp.series("clean", build, watch);
