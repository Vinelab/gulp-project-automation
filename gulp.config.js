(function() {
	module.exports = function () {
		var app = "./app/";
		var config = {

			lessPath: app + "_public/styles/less/*.less",
			cssPath: "./development/app/_public/styles/css/*.css",

			fontsPath: app + "_public/styles/fonts/*.*",

			htmlPath: app + "**/*.html",

			imgagesPath: app + "_public/images/*.*",


			tspath: app + "**/*.ts",

			jsPath: ["./development/app/*.module.js", "./development/app/app.*.js", "./development/app/**/*.js"],

			build: "./build/app/",

			client: app,

			dev: "./development/app/",

			index: "./index.html",

			testDest: "./test/dest/",

			testLib: "./test/lib/"
		};
		return config;
	};
}());
