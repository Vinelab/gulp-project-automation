'use strict';

/*
* * * Import namespace.min.js from https://github.com/mckoss/namespace/blob/master/namespace.min.js
* * * By importing this library, we'd be able to use Node's modules from the browser. 
* * * When we run the command "karma start karma.conf.js" it will open the browser 
* * * and will run the test file, but Node's modules will be unreachable and using require("..") or export will through an erro saying require is not defined.
*/
(function(e){function f(){}function g(a){if(!a)return 0;a=a.split(".");return 1E4*parseInt(a[0])+100*parseInt(a[1])+parseInt(a[2])}function h(a){for(var a=a.replace(/-/g,"_"),a=a.split("."),b=d,c=0;c<a.length;c++)b[a[c]]===void 0&&(b[a[c]]=new f),b=b[a[c]];return b}var d=e.namespace;if(d){if(g("3.0.1")<=g(d.VERSION))return;f=d.constructor}else e.namespace=d=new f;d.VERSION="3.0.1";e=f.prototype;e.module=function(a,b){var c=h(a);b&&b(c,h);return c};e.extend=function(a){for(var b in a)a.hasOwnProperty(b)&&
(this[b]=a[b])}})(this);


/*
* * * Create a Test module
*/
namespace.module('TestingModule', function (exports, require) {
  /*
  * * * Test for the input stream
  */
  describe('gulp input stream', function() {
      describe('src()', function() {
        var gulp = require("gulp");
        var fs = require('graceful-fs');
        var should = require('should');
        var join = require('path').join;

        it('should return a stream', function() {
            var stream = function () {
              return gulp.src("lib/test.txt");
            };
            stream.onload = function () {
              should.exist(stream());
            };  
        });
        it('should return a input stream from a direct path', function() {
            var stream = function () {
              return gulp.src("lib/test.txt");
            };
            stream.onerror = function () {
              console.log("error");
            };
            stream.onload =  function(file) {
              should.exist(file);
              should.exist(file.path);
              should.exist(file.contents);
              join(file.path, '').should.equal("lib/test.txt");
              String(file.contents).should.equal("THIS IS A TEST");
            };
        });
        it('should return an input stream for multiple paths', function() {
          var files = [];
          var stream = function () {
            return gulp.src(["lib/test.txt", "lib/test1.txt"]);
          };
            stream.onerror = function () {
              console.log("error");
            };
            stream.onload =  function (file) {
              should.exist(file);
              should.exist(file.path);
              files.push("lib/test.txt");
              files.push("lib/test1.txt");
              should(files.length).equal(2);
              should(files[0].path).equal("lib/test.txt");
              should(files[1].path).equal("lib/test1.txt");
            };
        });
        it('should return a input stream from a deep glob', function() {
            var stream = function () {
              return gulp.src(join(__dirname, "lib/*1.txt"));
            };
            stream.onerror = function () {
              console.log("error");
            };
            stream.onload = function (file) {
              should.exist(file);
              should.exist(file.path);
              should.exist(file.contents);
              join(file.path, '').should.equal(join(__dirname, 'lib/test1.txt'));
              String(file.contents).should.equal('THIS IS A TEST');
            };
        });
      });
  });
  
  /*
  * * * Test for the output stream
  */
  describe('gulp output stream', function() {
      describe('dest()', function() {
        var gulp = require("gulp");
        var fs = require('graceful-fs');
        var should = require('should');
        var join = require('path').join;

        it('should return a stream', function() {
            var stream = function () {
              return gulp.dest("lib/");
            };
            stream.onload = function () {
              should.exist(stream);
            };   
        });
        it('should return a output stream that writes files', function() {
            var instream = function () {
              return gulp.src('lib/*.txt');
            };
            var outstream = function () {
              return gulp.dest("lib/");
            };
            outstream.onerror = function () {
              console.log("error");
            }
            outstream.onload = function(file) {
              instream.pipe(outstream);

              should.exist(file);
              should.exist(file.path);
              should.exist(file.contents);
              String(file.contents).should.equal('THIS IS A TEST');
              fs.readFile('lib/test.txt'), function(err, contents) {
                  should.not.exist(err);
                  should.exist(contents);
                  String(contents).should.equal('THIS IS A TEST');
              };
            };
        });

        it('should return an output stream that writes streaming files into new directories (read: false, buffer: false)', function() {
            testWriteDir({buffer: false, read: false});
        });

        function testWriteDir(srcOptions) {
            var instream = function () {
              return gulp.src(('lib/'), srcOptions);
            };
            var outstream = function () {
              return instream.pipe(gulp.dest("lib/new/"));
            };

            outstream.onerror = function () {
              console.log("error");
            };
            outstream.onload = function(file) {
              should.exist(file);
              should.exist(file.path);
              fs.exists("lib/new/", function(exists) {
                  should(exists).be.ok;
              });
            };
        }
      });
  });
  
  /*
  * * * Test for the tasks
  */
  describe('gulp tasks', function() {
      var gulp = require("gulp");
      var fs = require('graceful-fs');
      var should = require('should');
      var join = require('path').join;

      describe('task()', function() {
        it('should define a task', function() {
            var fn = function() {};
            fn.onload = function () {
              gulp.task('test', fn);
              should.exist(gulp.tasks.test);
              gulp.tasks.test.fn.should.equal(fn);
              gulp.reset();
            };
        });
      });
      describe('run()', function() {
        it('should run multiple tasks', function() {
            var a = 0;
            var fn = function() {
              this.should.equal(gulp);
              ++a;
            };
            var fn2 = function() {
              this.should.equal(gulp);
              ++a;
            };
            var task = function () {
              return gulp.task('test', fn);
            };
            var task2 = function () {
              return gulp.task('test2', fn2);
            };
            task2.onload = function () {
              gulp.run(task.test, task2.test2); 
              a.should.equal(2);
              gulp.reset();
            };        
        });
        it('should run all async callback tasks', function() {
            var a = 0; 
            var fn = function(cb) {
              setTimeout(function() {
                  ++a;
                  cb(null);
              }, 1);
            };
            var fn2 = function(cb) {
              setTimeout(function() {
                ++a;
                  cb(null);
              }, 1);
            };
            fn2.onload = function () {
              gulp.task('test', fn);
              gulp.task('test2', fn2);
              gulp.run('test');
              gulp.run('test2', function() {
                gulp.isRunning.should.equal(false);
                a.should.equal(2);
                gulp.reset();
              });
              gulp.isRunning.should.equal(true);
            };
        });
        it('should run task scoped to gulp', function() {
            var a = 0;
            var fn = function() {
              this.should.equal(gulp);
              ++a;
            };
            fn.onload = function () {
              gulp.task('test', fn);
              gulp.run('test');
              a.should.equal(1);
              gulp.isRunning.should.equal(false);
              gulp.reset();
            };
        });
        it('should run a default task scoped to gulp', function() {
            var a = 0;
            var fn = function() {
              this.should.equal(gulp);
              ++a;
            };
            fn.onload = function () {
              gulp.task('default', fn);
              gulp.run();
              a.should.equal(1);
              gulp.isRunning.should.equal(false);
              gulp.reset();
            };
        });
      });
  });
});