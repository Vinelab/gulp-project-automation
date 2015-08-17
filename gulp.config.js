(function() {
	module.exports = function () {
		var app = "./app/";
		var config = {
			allcss: "./development/app/_public/styles/css/*.css",

			allfonts: app + "_public/styles/fonts/*.*",

			allhtml: app + "**/*.html",

			allimg: app + "_public/img/*.*",

			alljs: ["./development/app/app.module.js", "./development/app/app.*.js", "./development/app/**/*.js"],

			allless: app + "_public/styles/less/*.less",

			allts: [app + "app.*.ts", app + "**/*.ts"],

			build: "./build/app/",

			client: app,

			dev: "./development/app/",

			index: "./index.html"
		};
		return config;
	};
}());