(function() {
	module.exports = function () {
		var config = {
			var app = "./app/";

			allcss: "./development/app/_public/styles/css/*.css",

			allfonts: client + "_public/styles/fonts/*.*",

			allhtml: client + "**/*.html",

			allimg: client + "_public/img/*.*",

			alljs: ["./development/app/app.module.js", "./development/app/app.*.js", "./development/app/**/*.js"],

			allless: client + "_public/styles/less/*.less",

			allts: [client + "app.*.ts", client + "**/*.ts"],

			build: "./build/app/",

			client: "./app",

			dev: "./development/app/",

			index: "./index.html"
		};
		return config;
	};
}());