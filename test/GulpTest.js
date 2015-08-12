'use strict';
(function(e){function f(){}function g(a){if(!a)return 0;a=a.split(".");return 1E4*parseInt(a[0])+100*parseInt(a[1])+parseInt(a[2])}function h(a){for(var a=a.replace(/-/g,"_"),a=a.split("."),b=d,c=0;c<a.length;c++)b[a[c]]===void 0&&(b[a[c]]=new f),b=b[a[c]];return b}var d=e.namespace;if(d){if(g("3.0.1")<=g(d.VERSION))return;f=d.constructor}else e.namespace=d=new f;d.VERSION="3.0.1";e=f.prototype;e.module=function(a,b){var c=h(a);b&&b(c,h);return c};e.extend=function(a){for(var b in a)a.hasOwnProperty(b)&&
(this[b]=a[b])}})(this);
namespace.module('TestingModule', function (exports, require) {
	describe('gulp input stream', function() {
  		describe('src()', function() {
    		it('should return a stream', function() {
      			var gulp = require("gulp");
    			var fs = require('graceful-fs');
				var should = require('should');
				var join = require('path').join;
      			var stream = function () {
      				return gulp.src("./lib/test.txt");
      			};
      			setTimeout(function () {
      				should.exist(stream);
      			}, 1000);    
    		});
    		it('should return a input stream from a flat path', function() {
      			var stream = function () {
      				return gulp.src("./lib/test.txt");
      			};
      			setTimeout(function () {
      				stream.onerror = function () {
      					console.log("error");
      				};
      				stream.ondata =  function(file) {
        				should.exist(file);
        				should.exist(file.path);
        				should.exist(file.contents);
        				join(file.path, '').should.equal("./lib/test.txt");
        				String(file.contents).should.equal("THIS IS A TEST");
      				};
      				stream.onend = function() {
        				console.log("done");
      				};
     			}, 1000);
    		});
    		it('should return an input stream for multiple paths', function() {
    			var files = [];
     			var stream = function () {
     				return gulp.src(["./lib/test.txt", "./lib/test1.txt"]);
     			};
      			setTimeout(function () {
      				stream.onerror = function () {
      					console.log("error");
      				};
      				stream.ondata =  function(file) {
        				should.exist(file);
        				should.exist(file.path);
        				files.push("./lib/test.txt");
        				files.push("./lib/test1.txt");
      				};
      				stream.onend = function() {
        				should(files.length).equal(2);
        				should(files[0].path).equal("./lib/test.txt");
        				should(files[1].path).equal("./lib/test1.txt");
        				console.log("done");
      				};
      			}, 1000);
    		});
    		it('should return a input stream from a deeper glob', function() {
      			var stream = function () {
      				return gulp.src('lib/*.txt');
      			};
      			var a = 0;
      			setTimeout(function () {
      				stream.onerror = function () {
      					console.log("error");
      				};
      				stream.ondata = function() {
        				++a;
      				};
      				stream.onend = function() {
        				a.should.equal(2);
        				console.log("done");
      				};
      			}, 1000);
    		});
  		});
	});

	describe('gulp output stream', function() {
  		describe('dest()', function() {
    		it('should return a stream', function() {
      			var gulp = require("gulp");
    			var fs = require('graceful-fs');
				var should = require('should');
      			var stream = function () {
      				return gulp.dest("lib/");
      			};
      			setTimeout(function () {
      				should.exist(stream);
      			}, 1000);    
    		});
    		it('should return a output stream that writes files', function() {
      			var instream = function () {
      				return gulp.src('lib/*.txt');
      			};
      			var outstream = function () {
      				return gulp.dest("lib/");
      			};
      			setTimeout(function () {
      				instream.pipe(outstream);

      				outstream.onerror = function () {
      					console.log("error");
      				}
      				outstream.ondata = function(file) {
        				// Data should be re-emitted right
        				should.exist(file);
        				should.exist(file.path);
        				should.exist(file.contents);
        				String(file.contents).should.equal('THIS IS A TEST');
      				};
      				outstream.onend = function() {
        				fs.readFile('lib/test.txt'), function(err, contents) {
          					should.not.exist(err);
          					should.exist(contents);
          					String(contents).should.equal('THIS IS A TEST');
          					console.log("done");
        				};
      				};
      			}, 1000);
    		});

			it('should return a output stream that writes streaming files into new directories (read: false, buffer: false)', function() {
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
      			outstream.ondata = function(file) {
        			// data should be re-emitted right
        			should.exist(file);
        			should.exist(file.path);
      			};
      			outstream.onend = function() {
        			fs.exists(join("lib/"), function(exists) {
          				/* Stinks that ok is an expression instead of a function call */
          				/* jshint expr: true */
          				should(exists).be.ok;
          				/* jshint expr: false */
          				console.log("done");
        			});
      			};
    		}

  		});
	});
});