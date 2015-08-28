/*
* * * Authored by Mohammad K. Sidani: mohdsidani@gmail.com / moe.sidani@vinelab.com
*/

(function () {

  'use strict';

  var browserSync = require("browser-sync");
  var clean = require("del");
  var config = require("./gulp.config.js")();
  var gulp = require("gulp");
  var lazy = require("gulp-load-plugins")({lazy: true});
  var runSequence = require("run-sequence"); /* Exceptionally used to run tasks in a sequence - not in parallel */
  var wiredep = require("wiredep");


  /*                                 */
 /* * * Development Environment * * */
/*                                 */

/*
* * * Run this task to List all tasks
*/
gulp.task("list-tasks", lazy.taskListing);


/*
* * * Compile Typescript to JavaScript 
*/
gulp.task("ts-compiler", function () {
  tsCompiler(config.allts, config.dev);
});
/*
* * * This task is used for testing. Compile a simple ts file to js
*/
gulp.task("test-ts-compiler", function () {
  tsCompiler(config.testLib + "*.ts", config.testDest);
});

function tsCompiler (src, dest) {
  return gulp.src(src)
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
              module : "amd",
 
              // Specify ECMAScript target version: 'ES3' (default), or 'ES5' 
              target : "ES5"
            }))
            .pipe(gulp.dest(dest));
};


/*
* * * Less to Css conversion 
*/
gulp.task("less-css", function () {
  lessCss(config.allless, config.dev + "_public/styles/css/");
});
/*
* * *This task is used for testing. Compile simple less file to css
*/
gulp.task("test-less-css", function () {
  lessCss(config.testLib + "*.less", config.testDest);
});

function lessCss (src, dest) {
  return gulp.src(src)
             .pipe(lazy.less())
             .pipe(gulp.dest(dest));
};


/*
* * * Concat all Css files in one file
*/
gulp.task("concat-css", function () {
  concatCss(config.allcss, config.dev + "_public/styles/css/", "main.css");
});
/*
* * *This task is used for testing. Concat css files
*/
gulp.task("test-concat-css", function () {
    concatCss([config.testDest + "test-style*.css", config.testDest + "newstyle.css"], config.testDest + "dest/", "test-main.css");
});

function concatCss (src, dest, name) {
  return gulp.src(src)
             .pipe(lazy.concatCss(name))
             .pipe(gulp.dest(dest)); 
};


/*
* * * Add browser prefixes to make the Css rules compatible across browsers in the main.css file
*/
gulp.task("auto-prefixer", function () {
  autoPrefixer(config.dev + "_public/styles/css/main.css", config.dev + "_public/styles/css/");
});
/*
* * * This task is used for testing. Simply adds browser prefixes to the main css file test-main.css
*/
gulp.task("test-auto-prefixer", function () {
    return gulp.src(config.testDest + "dest/test-main.css")
               .pipe(lazy.autoprefixer({
                  browsers: ["> 0%"],
                  cascade: true
               }))
               .pipe(gulp.dest(config.testDest + "dest/")); autoPrefixer(config.testDest + "dest/test-main.css", config.testDest + "dest/");
});

function autoPrefixer (src, dest) {
    return gulp.src(src)
               .pipe(lazy.autoprefixer({
                  browsers: ["> 0%"],
                  cascade: true
               }))
               .pipe(gulp.dest(dest));
};


/*
* * * Inject all Bower components into index.html 
*/
gulp.task("bower-injector", function () {
  bowerInjector(config.index, "", "")
});
/*
* * * This task is used for testing. Simply adds bower components into test-index.html
*/
gulp.task("test-bower-injector", function () {
  bowerInjector(config.index, config.testDest + "dest/", "test")
});

function bowerInjector (src, dest, type) {
    return gulp.src(src)
               .pipe(wiredep.stream())
               .pipe(lazy.if(type === "test", lazy.rename({prefix: 'test-'})))
               .pipe(gulp.dest(dest)); 
};


/*
* * * Inject all JavaScript files into index.html
*/
gulp.task("js-injector", function () {                                    
  jsInjector(config.index, config.alljs, "");
});
/*
* * * This task is used for testing. Simply adds js scripts components into test-index.html
*/
gulp.task("test-js-injector", function () {                                    
  jsInjector(config.testDest + "dest/test-index.html", config.testDest + "*.js", config.testDest + "dest/");
});

function jsInjector (src, path, dest) {
    return gulp.src(src)
               .pipe(lazy.inject(gulp.src(path, {read: false})))
               .pipe(gulp.dest(dest)); 
};

/*
* * * Inject all Css files into index.html
*/
gulp.task("css-injector", function () {
  cssInjector(config.index, config.dev + "_public/styles/css/main.css", "");
});
/*
* * * This task is used for testing. Simply adds Css scripts components into test-index.html
*/
gulp.task("test-css-injector", function () {
  cssInjector("./Test/dest/dest/test-index.html", config.testDest + "dest/test-main.css", config.testDest + "dest/");
});

function cssInjector (src, path, dest) {
    return gulp.src(src)
               .pipe(lazy.inject(gulp.src(path, {read: false})))
               .pipe(gulp.dest(dest)); 
};

/*
* * * Move all HTML files to "development" destination
*/
gulp.task("copy-html", function () {
    return gulp.src(config.allhtml)
               .pipe(gulp.dest(config.dev));
});


/*
* * *  Watch for newly added Typescript files, compile them, and then added their Js files into index.html. 
* * * If a file has been deleted, its corresponding Js will be deleted and its following script will be 
* * * also deleted from index.html
*/ 
gulp.task("ts-watcher", function () {
    lazy.watch(["./app/**/", "!./app/**/*.html" ,"!./app/**/**/**/*.less", "!./app/**/**/**/*.css"])
        .on("add", function (path) {  
          console.log("New file has been added " + path);
          runSequence("ts-compiler", "js-injector"); 
        })
        .on("change", function (path) {
            console.log("File has been changed " + path);
            gulp.start("ts-compiler");
        })
        .on("unlink", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.length - 3);
            var jsPath = filePath.replace(".ts", ".js").replace("/app", "/development/app");
            console.log("File has been deleted " + filePath);
            clean(jsPath, function () {
              gulp.start("js-injector");
            });
        });
});


/*
* * * Watch for newly added Less files, compile them, and then added their Css files into index.html. 
* * * If a file has been deleted, its corresponding Css will be deleted and its following stylesheet 
* * * will be also deleted from index.html
*/ 
gulp.task("less-watcher", function () {
    lazy.watch(["./app/**/", "!./app/*.ts", "!./app/**/*.html", "!./app/**/*.ts", "!./app/**/**/**/*.css"])
        .on("add", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.lastIndexOf("."));
            console.log("New file has been added " + path);
            runSequence("less-css", "concat-css", "auto-prefixer", "css-injector");
        })
        .on("change", function (path) {
            console.log("File has been changed " + path);
            runSequence("less-css", "concat-css", "auto-prefixer");
        })
        .on("unlink", function (path) {
            var index = path.indexOf(config.client);
            var filePath = path.substring(index);
            var suffix = path.substring(path.lastIndexOf("."));
            var cssPath = filePath.replace("less", "css").replace(".less", ".css").replace("/app", "/development/app");
            console.log("File has been deleted " + filePath);
            clean(cssPath, function () {
              gulp.start("css-injector");
            });
        });
});


/*
* * * Browser Sync Starter
*/
gulp.task("browser-sync", startBrowserSync);


/*
* * * Browser Sync configuration. Synchronize code across browsers. Watch for changes and reload the browsers.
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







  /*                                  */
 /* * *     Build Environment    * * */
/*                                  */

/*
* * * Minify Html
*/
gulp.task("minify-html", function () {
  minifyHtml(config.allhtml, config.build, "");
});
/*
* * * This task is used for testing. To check whether a simple html page has been minified or not
*/
gulp.task("test-minify-html", function () {
  minifyHtml(config.testLib + "test.html", config.testDest, "test")
});

function minifyHtml (src, dest, type) {
    return gulp.src(config.testLib + "test.html")
               .pipe(lazy.minifyHtml({conditionals: true, spare:true}))
               .pipe(lazy.if(type === "test", lazy.rename({suffix: ".min"})))
               .pipe(gulp.dest(config.testDest));
};


/*
* * * Compressing Images
*/
gulp.task("images", function () {
  images(config.allimg, config.build + "_public/img");
});
/*
* * * This tasks is used for testing. To check whether a simple image has been minified or not
*/
gulp.task("test-images", function () {
  images(config.testLib + "img.jpg", config.testDest);
});

function images (src, dest) {
    return gulp.src(src)
               .pipe(lazy.imagemin({optimizationLevel: 5}))
               .pipe(gulp.dest(dest)); 
};



/*
* * * Copying fonts to their destination 
*/
gulp.task("copy-fonts", function () {
    return gulp.src(config.allfonts)
               .pipe(gulp.dest(config.build + "_public/styles/fonts"))
});


/*
* * * Template cache
*/  
gulp.task("template-cache", function () {
  templateCache(config.allhtml, config.build);
});
/*
* * * This task is used for testing.
*/
gulp.task("test-template-cache", function () {
  templateCache(config.testLib + "tmpl.html", config.testDest);
});

function templateCache (src, dest) {
    return gulp.src(src)
               .pipe(lazy.minifyHtml({empty: true}))
               .pipe(lazy.angularTemplatecache())
               .pipe(gulp.dest(dest));
};


/*
* * * Minify Css
*/
gulp.task("minify-css", function () {
  minifyCss(config.build + "main.css", ".optimized.min", config.build)
});
/*
* * * This task is used for testing. To check whether a simple css file has been minified or not
*/
gulp.task("test-minify-css", function () {
  minifyCss(config.testLib + "test.css", ".min", config.testDest);
});

function minifyCss (src, Suffix, dest) {
    return gulp.src(src)
               .pipe(lazy.minifyCss({keepBreaks: false}))
               .pipe(lazy.rename({suffix: Suffix}))
               .pipe(gulp.dest(dest));
};


/*
* * * Minify JS
*/
gulp.task("minify-js", function () {
  minifyJs(config.build + "build.js", ".optimized.min", config.build);
});
/*
* * * This task is used for testing. To check whether a simple css file has been minified or not
*/
gulp.task("test-minify-js", function () {
  minifyJs(config.testLib + "test.js", ".min", config.testDest);
});

function minifyJs (src, Suffix, dest) {
    return gulp.src(src)
               .pipe(lazy.stripDebug())
               .pipe(lazy.uglify())
               .pipe(lazy.rename({suffix: Suffix}))
               .pipe(gulp.dest(dest));
};


/*
* * * Fix angular's dependecie's names 
*/
gulp.task("dependency-fixer", function () {
  dependencyFixer(config.alljs, config.dev);
});
/*
* * * This task is used for testing. It should inject angular dependecies 
*/
gulp.task("test-dependency-fixer", function () {
  dependencyFixer(config.testLib + "dependency-test.js", config.testDest);
});

function dependencyFixer (src, dest) {
  return gulp.src(src)
             .pipe(lazy.ngAnnotate()) 
             .pipe(gulp.dest(dest));
};


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
      .pipe(lazy.rename("./build/app/build.js"))
      .pipe(gulp.dest(""))
      .on("end", function () {
        clean(config.build + "build.optimized.min.js");
      });
  gulp.src(config.build + "main.optimized.min.css")
      .pipe(lazy.rename("./build/app/main.css"))
      .pipe(gulp.dest(""))
      .on("end", function () {
        clean(config.build + "main.optimized.min.css");
      });
}






  /*                                 */
 /* * *      Two Main Tasks     * * */
/*                                 */

/*
* * * Fire the main task to create the "development" environment.  
*/
gulp.task("env-development", function () {
    runSequence("ts-compiler", 
                "less-css", 
                "concat-css",
                "auto-prefixer",
                "bower-injector", 
                "js-injector", 
                "css-injector",
                "copy-html",
                "ts-watcher", 
                "less-watcher",
                "browser-sync");
});


/*
* * * Fire the main tasks to prepare the "build" environment. Optimize All. For publishing app.js lib.js app.css lib.css
*/
gulp.task("env-build", ["minify-html", 
                        "images", 
                        "copy-fonts", 
                        "template-cache"], useRefBuild);
}());