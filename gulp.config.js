(function() {
	module.exports = function () {

	  var GlobalConfig = {
	    env: process.env.NODE_ENV,
	    appName: 'App',
	    appPath: 'app/',
	    // configuration used in the app depending on the development environment
	    inAppConfig: require('./config/' + process.env.NODE_ENV + '.json')
	  };

		return {

			inAppConfig: GlobalConfig.inAppConfig,
			appName: GlobalConfig.appName,

			environment: GlobalConfig.env,

			localBuild: 'build',

			appPath: GlobalConfig.appPath,

			lessPath: GlobalConfig.appPath + "_public/styles/less/*.less",
			cssPath:  "build/_public/styles/*.css",

			fontsPath: GlobalConfig.appPath + "_public/styles/fonts/*.*",
			htmlPath: GlobalConfig.appPath + "**/*.html",
			imagesPath: GlobalConfig.appPath + "_public/images/*.*",

			tsPath: GlobalConfig.appPath + "**/*.ts",
			jsPath: ["build/*.module.js", "build/app.*.js", "build/**/*.js"],

			index: "index.html",

			serverBuild: "./public/build/"
		};

	};
}());
