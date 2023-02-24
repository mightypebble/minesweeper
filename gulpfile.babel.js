/* eslint-disable strict */

'use strict';

/* eslint-disable no-use-before-define */
import plugins from 'gulp-load-plugins';
import browser from 'browser-sync';
import gulp from 'gulp';
import gulpStylelint from 'gulp-stylelint';
import panini from 'panini';
import rimraf from 'rimraf';
import sherpa from 'style-sherpa';
import webpackStream from 'webpack-stream';
import webpack2 from 'webpack';
import named from 'vinyl-named';
import settings from './settings.json';

// Load all Gulp plugins into one variable
const $ = plugins();

// Load settings from settings.yml
const { COMPATIBILITY, PORT, PATHS } = settings;

// Build the "dist" folder by running all of the below tasks
gulp.task('build', gulp.series(clean, gulp.parallel(templates, stylelint, styles, jsbuild, images), styleguides));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series('build', server, watch));

gulp.task('stylelint', gulp.series(stylelint));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf(PATHS.dist.root, done);
}

// Copy page templates into finished HTML files
function templates() {
    return gulp
        .src(`${PATHS.templates.root}**/*.{html,hbs,handlebars}`)
        .pipe(
            panini({
                root: PATHS.templates.root,
                layouts: PATHS.templates.layouts,
                partials: PATHS.templates.partials,
                data: PATHS.templates.data
            })
        )
        .pipe(gulp.dest(PATHS.dist.root));
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
    panini.refresh();
    done();
}

function stylelint() {
    return gulp.src('src/**/*.scss').pipe(
        gulpStylelint({
            reporters: [{ formatter: 'string', console: true }]
        })
    );
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleguides(done) {
    sherpa(
        'src/styleguide/index.md',
        {
            output: `${PATHS.dist.root}/typography.html`,
            template: 'src/styleguide/template.html'
        },
        done
    );
}
// Compile Sass into CSS
// In production, the CSS is compressed
function styles() {
    return gulp
        .src(PATHS.src.styles.entry)
        .pipe($.sourcemaps.init())
        .pipe(
            $.sass({
                includePaths: PATHS.src.styles.modules
            }).on('error', $.sass.logError)
        )
        .pipe(
            $.autoprefixer({
                browsers: COMPATIBILITY
            })
        )
        .pipe($.cleanCss({ compatibility: 'ie9' }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(`${PATHS.dist.styles}`))
        .pipe(browser.reload({ stream: true }));
}

const webpackConfig = {
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'eslint-loader']
            }
        ]
    }
};
function jsbuild() {
    return gulp
        .src(PATHS.src.scripts.entry)
        .pipe(named())
        .pipe($.sourcemaps.init())
        .pipe(webpackStream(webpackConfig, webpack2))
        .pipe(
            $.uglify().on('error', (e) => {
                console.log(e);
            })
        )
        .pipe(gulp.dest(`${PATHS.dist.scripts}`));
}
function jsdev() {
    return gulp
        .src(PATHS.src.scripts.entry)
        .pipe(named())
        .pipe($.sourcemaps.init())
        .pipe(webpackStream(webpackConfig, webpack2))
        .pipe(
            $.uglify().on('error', (e) => {
                console.log(e);
            })
        )
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(`${PATHS.dist.scripts}`));
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return (
        gulp
            .src(`${PATHS.src.assets.root}/**/*`)
            .pipe(named())
            // .pipe($.imagemin())
            .pipe(gulp.dest(`${PATHS.dist.assets}`))
    );
}

// Start a server with BrowserSync to preview the site in
function server(done) {
    browser.init({
        server: PATHS.dist.root,
        port: PORT
    });
    done();
}

// Reload the browser with BrowserSync
function reload(done) {
    browser.reload();
    done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
    gulp.watch('src/templates/pages/**/*.html').on('all', gulp.series(templates, reload));
    gulp.watch('src/templates/{layouts,partials}/**/*.html').on('all', gulp.series(resetPages, templates, reload));
    gulp.watch(`${PATHS.templates.data}/*.json`).on('all', gulp.series(resetPages, templates, reload));
    gulp.watch('src/styles/**/*.scss').on('all', stylelint);
    gulp.watch('src/styles/**/*.scss').on('all', styles);
    gulp.watch('src/scripts/**/*.js').on('all', gulp.series(jsdev, reload));
    gulp.watch('src/assets/images/**/*').on('all', gulp.series(images, reload));
    gulp.watch('src/styleguide/**').on('all', gulp.series(styleguides, reload));
}
