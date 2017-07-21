var gulp = require('gulp'),
 browserSync = require('browser-sync').create();
 var reload = browserSync.reload;

// Watch key files and refresh browsers
gulp.task('browsersync', function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
          proxy: "http://localhost:5000/"
        }
    });

    gulp.watch(["public/*", "routes/*", "views/*"]).on("change", reload);
});

gulp.task('default', ['browsersync']);
