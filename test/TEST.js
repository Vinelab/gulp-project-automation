/*
* * * Testing the gulp tasks using Node.js
*/
(function() {
      'use strict';
      var gulp = require("gulp");
      var fs = require('fs');
      var exec = require('child_process').exec;
      var browserSync = require("browser-sync");
      var ts_watcher, less_watcher;
      var count = 0;


      test_ts_compiler("./Test/dest/file.js", "normal"); // FIRST CALL 

      /*
      * * * It should compile from ts to js and read the js file from the destination folder
      */
      function test_ts_compiler (file, type) {
          console.log(" ");
          console.log("1- test_ts_compiler ");
          console.log(" ");
          exec("gulp test-ts-compiler", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile(file, function (error) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been successfully read: " + file);
                  if (type === "normal") //Issued on the first call
                    test_less_css("normal");
                  else if (type === "new file") //Issued from the test_ts_watcher on new file, means it should inject the new js into index.html
                    test_js_injector("newfile.js");
                  else if (type === "change file") { } //Issued from the test_ts_watcher on file change, so it shouldn't continue to the next function
                }
              });
          });
      };

     /*
     * * * It should compile from less to css and read the css files from the destination folder
     */
     function test_less_css (type) {
          console.log(" ");
          console.log("2- test_less_css ");
          console.log(" ");
          exec("gulp test-less-css", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }
              if (type === "normal") {
                  fs.readFile("./Test/dest/test-style.css", function (error) {
                    if (error !== null) {
                      console.log("Error: File doesn't exist.");
                    } else {
                      console.log("SUCESS: File has been successfully read: test-style.css");
                    }
                  });
                  fs.readFile("./Test/dest/test-style1.css", function (error) {
                    if (error !== null) {
                      console.log("Error: File doesn't exist.");
                    } else {
                      console.log("SUCESS: File has been successfully read: test-style.css");
                      test_concat_css("normal");
                    }
                  });
              }
              else {
                fs.readFile("./Test/dest/newstyle.css", function (error) {
                    if (error !== null) {
                      console.log("Error: File doesn't exist.");
                    } else {
                      console.log("SUCESS: File has been successfully read: test-style.css");
                      test_concat_css("new file");
                    }
                });
              }
          });
      };

     /*
     * * * It should concat all css files in their destination folder
     */
     function test_concat_css (type) {
          console.log(" ");
          console.log("3- test_concat_css ");
          console.log(" ");
          exec("gulp test-concat-css", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile("./Test/dest/dest/test-main.css", function (error) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been successfully read: test-main.css");
                  test_auto_prefixer(type);
                }
              });
          });
      };

     /*
     * * * It should add browser prefixes to the test-main.css
     */
     function test_auto_prefixer (type) {
          console.log(" ");
          console.log("4- test_auto_prefixer ");
          console.log(" ");
          exec("gulp test-auto-prefixer", function (error, stdout, stderr, data) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile("./Test/dest/dest/test-main.css", function (error, data) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been read successfully.");
                  var buffer = data.toString();
                  if (buffer.search("-webkit-") !== -1) {
                    console.log("SUCESS: Browser prefixes has been successfully added to test-main.css");
                    if (type === "normal")
                      test_bower_injector();
                    else if (type === "new file")
                      test_css_injector("new file");
                    else if (type === "change file") { }
                  } else {
                    console.error("Error: There was an error adding browser prefixes.")
                  }
                }
              });
          });
      };

     /*
     * * * It should inject all bower components into test-index.html
     */
     function test_bower_injector () {
          console.log(" ");
          console.log("5- test_bower_injector ");
          console.log(" ");
          exec("gulp test-bower-injector", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile("./Test/dest/dest/test-index.html", function (error, data) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been read successfully.");
                  var buffer = data.toString();
                  if (buffer.search("bower_components/") !== -1) {
                    console.log("SUCESS: Bower components have been successfully added to test-index.html");
                    test_js_injector("file.js");
                  } else {
                    console.error("Error: There was an error injecting bower components.")
                  }
                }
              });
          });
      };

     /*
     * * * It should inject file.js script into test-index.html
     */
     function test_js_injector (file) {
          console.log(" ");
          console.log("6- test_js_injector ");
          console.log(" ");
          exec("gulp test-js-injector", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile("./Test/dest/dest/test-index.html", function (error, data) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been read successfully.");
                  var buffer = data.toString();
                  console.log('<script src="/test/dest/' + file + '"></script>');
                  if (buffer.search('<script src="/test/dest/' + file + '"></script>') !== -1) {
                    console.log("SUCESS: The script with src pointing to " + file + " has been successfully added to test-index.html");
                    if (file.search("newfile") === -1)
                      test_css_injector("normal");
                    else {
                      ++count;
                      console.log(" ");
                      console.log("New file 'newfile.ts' has been added and compiled to js.");
                      console.log(" ");
                      console.log("Deleting 'newfile.ts'...");
                      delete_new_file("newfile.ts");
                    }
                  } else {
                    console.error("Error: There was an error adding " + file + " script into test-index.html. Maybe it has been unInjected.");
                    ts_watcher.close();
                    setTimeout(function () {
                      test_less_watcher();
                    }, 10);
                  }
                }
              });
          });
      };

     /*
     * * * It should inject test-main.css stylesheet into test-index.html
     */
     function test_css_injector (type) {
          console.log(" ");
          console.log("7- test_css_injector ");
          console.log(" ");
          exec("gulp test-css-injector", function (error, stdout, stderr) {
              console.log(stdout);
              if (error !== null) {
                console.log('exec error: ' + error);
              }

              fs.readFile("./Test/dest/dest/test-index.html", function (error, data) {
                if (error !== null) {
                  console.log("Error: File doesn't exist.");
                } else {
                  console.log("SUCESS: File has been read successfully.");
                  var buffer = data.toString();
                  if (buffer.search('<link rel="stylesheet" href="/Test/dest/dest/test-main.css">') !== -1) {
                    console.log("SUCESS: The stylesheet with href pointing to test-main.css has been successfully added to test-index.html");
                    if (type === "normal") {
                      test_ts_watcher();
                    }
                    else if (type === "new file") {
                      console.log("New file 'newstyle.less' has been added and compiled to css. ");
                      console.log(" ");
                      console.log("Deleting 'newstyle.less'...");
                      delete_new_file("newstyle.less");
                    }
                    else if (type === "delete file") { 
                      less_watcher.close();
                      setTimeout(function () {
                        test_browser_sync();
                      }, 50);
                    }
                  } else {
                    console.error("Error: There was an error adding test-main.css stylesheet into test-index.html");
                  }
                }
              });
          });
      };

     /*
     * * * It should watch for ts changes
     */
     function test_ts_watcher () {
        console.log(" ");
        console.log("8- test_ts_watcher ");
        console.log(" ");
          
        ts_watcher = fs.watch("./Test/lib/", function (event, file) {
            if (event === "rename") {
              fs.readFile("./Test/lib/newfile.ts", function (error, data) {
                if (error !== null) {
                  console.log("File has been deleted: " + file);
                  delete_file("newfile.js", "js"); //then delete the corresponding js file
                } else {
                  console.log("New file has been added: " + file);
                  test_ts_compiler("./Test/lib/newfile.ts", "new file");
                }
              });
            } else if (event === "change") {
                console.log("File has been changed: " + file);
                test_ts_compiler("./Test/lib/newfile.ts", "change file");
            }
        });

        setTimeout( function () { 
            console.log("timeout...");
            write_new_file("newfile.ts");
        }, 50);
      };

     function write_new_file (file) {
        fs.writeFile("./Test/lib/" + file, function (error, data) { 
        });
     };

     function delete_new_file (file) {
        fs.unlink("./Test/lib/" + file, function (error, data) { 
        });
     };

     function delete_file (file, type) {
        fs.unlink("./Test/dest/" + file, function (error, data) { 
          if (type === "js")
            test_js_injector(file);
          else if (type === "css") {
            test_css_injector("delete file");
          }
        });
     };

     function change_file () {
        fs.readFile("./Test/lib/newfile.ts", 'utf8', function (error, data) {
          if (error) 
            return console.log(error);
          
          var result = data.replace(/data/g, 'changedData');

          fs.writeFile("./Test/lib/newfile.ts", result, 'utf8', function (err) {
            if (err) 
              return console.log(err);
          });
        });
     };


     /*
     * * * It should watch for ts changes
     */
     function test_less_watcher () {
        console.log(" ");
        console.log("9- test_less_watcher ");
        console.log(" ");
          
        less_watcher = fs.watch("./Test/lib/", function (event, file) {
            if (event === "rename") {
              fs.readFile("./Test/lib/newstyle.less", function (error, data) {
                if (error !== null) {
                  console.log("File has been deleted: " + file);
                  delete_file("newstyle.css", "css"); //then delete the corresponding css file
                } else {
                  console.log("New file has been added: " + file);
                  test_less_css("new file");
                }
              });
            } else if (event === "change") {
                console.log("File has been changed: " + file);
                test_less_css("change file");
            }
        });

        setTimeout( function () { 
            console.log("timeout...");
            write_new_file("newstyle.less");
        }, 50);
      };


    /*
    * * * It should check if browser sync package is active and working good
    */
    function test_browser_sync () {
        console.log(" ");
        console.log("10- test_browser_sync ");
        console.log(" ");
        browserSync.create();
        
        setTimeout(function () {
          browserSync.init({
            server: "./app"
          });
          console.log("Initiated browser-sync");
          setTimeout(function () {
            test_minify("gulp test-minify-html", "./Test/lib/test.html", "./Test/dest/test.min.html", "11", "html");
            test_minify("gulp test-minify-css", "./Test/lib/test.css", "./Test/dest/test.min.css", "12", "css");
            test_minify("gulp test-minify-js", "./Test/lib/test.js", "./Test/dest/test.min.js", "13", "js");
          }, 500);
        }, 5000); 
    };


    /*
    * * * It should minify html file
    */
    function test_minify (cmd, file, fileMin, num, type) {
      console.log(" ");
      console.log(num + "- test_minify_" + type);
      console.log(" ");

      exec(cmd, function (error, stdout, stderr) {
        var bufferBeforeMin, bufferAfterMin;
        fs.readFile(file, function (error, data) {
            if (error !== null) {
              console.log("Error: File doesn't exist.");
            } 
            bufferBeforeMin = data.toString();
        });
        fs.readFile(fileMin, function (error, data) {
            if (error !== null) {
              console.log("Error: File doesn't exist.");
            } 
            bufferAfterMin = data.toString();
        });
        setTimeout(function () {
          if (bufferBeforeMin === bufferAfterMin)
            console.log("Error: There was an error minifying this file " + file);
          else 
            console.log("SUCESS: The file " + file + " has been successfully minifed.");
            if (num === "13") {
              console.log(" ");
              console.log("By reaching this point, Gulp seems to be running perfectly on your system.");
              console.log(" ");
              console.log("You can run the Gulp tasks: gulp <task_name> or gulp env-development / gulp env-build");
              console.log(" ");
              console.log("Press CTRL + C to exit");
            }
        }, 500);
      });
    };
}());