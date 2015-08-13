/*
* * * Authored by Mohammad K. Sidani: mohdsidani@gmail.com / moe.sidani@vinelab.com
*/

'use strict';

var browserSync = require("browser-sync");
var clean = require("del");
var config = require("./gulp.config.js")();
var gulp = require("gulp");
var lazy = require("gulp-load-plugins")({lazy: true});
var runSequence = require("run-sequence");
var wiredep = require("wiredep");

/*
* * * Compile Typescript  files
*/
gulp.task("ts-compiler", function () {
  return gulp.src(config.allts)
    .pipe(lazy.typescript({
      // Generates corresponding .map file. 
      sourceMap : false,
 
      // Generates corresponding .d.ts file. 
      declaration : true,
 
      // Do not emit comments to output. 
      removeComments : false,
 
      // Warn on expressions and declarations with an implied 'any' type. 
      noImplicitAny : false,
 
      // Skip resolution and preprocessing. 
      noResolve : false,
 
      // Specify module code generation: 'commonjs' or 'amd'   
      module : 'amd',
 
      // Specify ECMAScript target version: 'ES3' (default), or 'ES5' 
      target : 'ES5'
    }))
    .pipe(gulp.dest(config.dev));
});


/*
* * * NgAnnotate   
* *   /*@ngInject*/
gulp.task("dependency-fixer", function () {
  return gulp.src(config.alljs)
             .pipe(lazy.ngAnnotate()) 
             .pipe(gulp.dest(config.dev));
});


/*
* * * LESS to CSS
*/
gulp.task("less-css", function () {
  return gulp.src(config.allless)
             .pipe(lazy.less())
             .pipe(gulp.dest(config.dev + "_public/styles/css"));
});


/*
* * * Auto-Prefixer
*/
gulp.task("auto-prefixer", function () {
    return gulp.src(config.dev + "_public/styles/css")
           .pipe(lazy.autoprefixer({
                browsers: ['last 2 versions'],
                cascade: false
           }))
           .pipe(gulp.dest(config.dev));
});


/*
* * * Inject all Bower components into index.html 
*/
gulp.task("bower-injector", function () {
    return gulp.src(config.index)
           .pipe(wiredep.stream())
           .pipe(gulp.dest(""));
});


/*
* * * Inject all JS into index.html
*/
gulp.task("js-injector", function () {                                    
    return gulp.src(config.index)
           .pipe(lazy.inject(gulp.src(config.alljs, {read: false})))
           .pipe(gulp.dest(""));
});


/*
* * * Move HTML to destination
*/
gulp.task("copy-html", function () {
    return gulp.src(config.allhtml)
               .pipe(gulp.dest(config.dev));
});


/*
* * * Inject all CSS into index.html
*/
gulp.task("css-injector", function () {
    return gulp.src(config.index)
           .pipe(lazy.inject(gulp.src(config.allcss)))
           .pipe(gulp.dest(""));
});


/*
* * *  Watch for newly added Typescript files, compile them, and then added their Js files into index.html. 
* * * If a file has been deleted, its corresponding Js will be deleted and its following script will be 
* * * also deleted from index.html
*/ 
gulp.task("new-ts-watcher", function () {
    lazy.watch("./app/**/")
        .on("add", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.length - 3);
            console.log("New file has been added " + filePath);
            if (suffix === ".ts") {
              runSequence("ts-compiler", "js-injector");
            }
        })
        .on("unlink", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.length - 3);
            console.log("File has been deleted " + filePath);
            if (suffix === ".ts") {
              var jsPath = filePath.replace(".ts", ".js").replace("/app", "./development/app");
              clean(jsPath, function () {
                gulp.start("js-injector");
              });
            }
        });
});


/*
* * * Watch for newly added Less files, compile them, and then added their Css files into index.html. 
* * * If a file has been deleted, its corresponding Css will be deleted and its following stylesheet 
* * * will be also deleted from index.html
*/ 
gulp.task("new-less-watcher", function () {
    lazy.watch("./app/**/")
        .on("add", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.lastIndexOf("."));
            console.log("New file has been added " + filePath);
            if (suffix === ".less") {
              runSequence("less-css", "css-injector");
            }
        })
        .on("unlink", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.lastIndexOf("."));
            console.log("New file has been deleted " + filePath);
            if (suffix === ".less") {
              var cssPath = filePath.replace("less", "css").replace(".less", ".css").replace("/app", "./development/app");
              clean(cssPath, function () {
                gulp.start("css-injector");
              });
            }
        });
});


/*
* * * Watch for changes in typescript files, recompiles the files, and then merges them 
* * * into one file using the useRef method
*/
gulp.task('ts-watcher', function() {
    gulp.watch(config.allts, function () {
        runSequence("ts-compiler");
    });
});


/*
* * * Watch for changes in less files, converts from less to css, and then merges them
* * * into one file using the useRef method 
*/
gulp.task('less-watcher', function() {
    gulp.watch(config.allless, function () {
        runSequence("less-css");
    });
});


/*
* * * Browser Sync Starter
*/
gulp.task("browser-sync", startBrowserSync);


/*
* * * Browser Sync function.
*/
function startBrowserSync() {
  var options = {
      proxy: "localhost:" + 9090,
      port: 9090,
      files: ["!./app/_public/styles/less/*.less", "./app/**/*.*"],
      ghostMode: {
        clicks: true,
        location: true,
        forms: true,
        scroll: true
      },
      injectChanges: true,
      logFileChanges: true,
      logLevel: "debug",
      logPrefix: "gulp-patterns",
      notify: true,
      reloadDelay: 0,
      browser: "safari"
  };

  if (browserSync.active) {
    return;
  } 

  gulp.start(["less-watcher", "ts-watcher"], function () {
    browserSync.reload();
  });

  browserSync(options);
}


/*
* * * It goes into the index.html. It merges all .js files into build.js and all .css files into main.css. 
*/
/*function useRefDev () {
  var assets = lazy.useref.assets();
  gulp.src(config.index)
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(lazy.useref())
      .pipe(gulp.dest(config.dev));
}*/


/*
* * * IF the environment is the build environment, it injects the html partials in the
* * * angular template cache before merging all the scripts together in one file.
*/
function useRefBuild () {
  var assets = lazy.useref.assets();
  gulp.src(config.index)
      .pipe(lazy.inject(gulp.src(config.build + "templates.js", {read: false}), {starttag: "<!-- inject:templates:js -->"}))
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(lazy.useref())
      .pipe(gulp.dest("./build"))
      .on("end", function () {
          runSequence("minify-js", "minify-css", "dependency-fixer", function () {
            clean([config.build + "main.css", config.build + "build.js", config.build + "templates.js"], rename);
          });
      });
}


/*
* * * Rename the newly optimized files back to build.js and main.css respectively, then delete the old optimized files, 
* * * because he useRef in the index.html is always pointing at two files named: build.js and main.css.
*/
function rename() {
  gulp.src(config.build + "build.optimized.min.js")
      .pipe(lazy.rename("./build/app/build.js")).pipe(gulp.dest(""))
      .on("end", function () {
        clean(config.build + "build.optimized.min.js");
      });
  gulp.src(config.build + "main.optimized.min.css")
      .pipe(lazy.rename("./build/app/main.css")).pipe(gulp.dest(""))
      .on("end", function () {
        clean(config.build + "main.optimized.min.css");
      });
}


/*
* * * Template cache
*/  
gulp.task("template-cache", function () {
    return gulp.src(config.allhtml)
               .pipe(lazy.minifyHtml({empty: true}))
               .pipe(lazy.angularTemplatecache())
               .pipe(gulp.dest(config.build));
});


/*
* * * Compressing Images
*/
gulp.task("images", function () {
    return gulp.src(config.allimg)
               .pipe(lazy.imagemin({optimizationLevel: 5}))
               .pipe(gulp.dest(config.build + "_public/img"))
});


/*
* * * Copying fonts to their destination 
*/
gulp.task("copy-fonts", function () {
    return gulp.src(config.allfonts)
               .pipe(gulp.dest(config.build + "_public/styles/fonts"))
});


/*
* * * Minify Html
*/
gulp.task("minify-html", function () {
    return gulp.src(config.allhtml)
           .pipe(lazy.minifyHtml({conditionals: true, spare:true}))
           .pipe(gulp.dest(config.build));
});


/*
* * * Minify Css
*/
gulp.task("minify-css", function () {
    return gulp.src(config.build + "main.css")
           .pipe(lazy.minifyCss({keepBreaks: false}))
           .pipe(lazy.rename({suffix: '.optimized.min'}))
           .pipe(gulp.dest(config.build));
});


/*
* * * Minify JS
*/
gulp.task("minify-js", function () {
    return gulp.src(config.build + "build.js")
           .pipe(lazy.stripDebug())
           .pipe(lazy.uglify())
           .pipe(lazy.rename({suffix: '.optimized.min'}))
           .pipe(gulp.dest(config.build));
});


/*
* * * List all tasks
*/
gulp.task("list-tasks", lazy.taskListing);


/*
* * * Prepare for the development environment.  
*/
gulp.task("env-development", function () {
    runSequence("ts-compiler", 
                "less-css", 
                "auto-prefixer", 
                "bower-injector", 
                "js-injector", 
                "css-injector",
                "copy-html",
                "ts-watcher", 
                "less-watcher",
                "new-ts-watcher",
                "new-less-watcher",
                "browser-sync");
});


/*
* * * Prepare for the building environment. Optimize All. For publishing app.js lib.js app.css lib.css
*/
gulp.task("env-build", ["minify-html", 
                        "images", 
                        "copy-fonts", 
                        "template-cache"], useRefBuild);