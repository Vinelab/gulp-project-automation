module.exports = function(config){
  config.set({

    basePath : '',

    files : [
      './Test/GulpTest.js'
    ],

    port : 9091,

    singleRun : true,

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-jasmine'
    ],

    junitReporter : {
     	outputFile: './Test/test_out.xml',
      	suite: 'unit'
    }

  });
};