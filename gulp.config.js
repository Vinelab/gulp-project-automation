module.exports = function () {
	var config = {

		allcss: "development/app/_public/styles/css/*.css",

		allfonts: "app/_public/styles/fonts/*.*",

		allhtml: "app/**/*.html",

		allimg: "app/_public/img/*.*",

		alljs: ["development/app/app.module.js", "development/app/app.*.js", "development/app/**/*.js"],

		allless: "app/_public/styles/less/*.less",

		allts: ["app/app.*.ts", "app/**/*.ts"],

		browserSync: ["!app/_public/styles/less/*.less", "app/**/*.*"],

		build: "build/",

		buildCss: "build/app/main.css",

		buildDest: "build/app",

		buildJs: "build/app/build.js",

		buildMinJs: "./build/app/build.optimized.min.js",

		buildMinCss: "./build/app/main.optimized.min.css",

		buildTmpl: "build/app/templates.js",

		client: "/app",

		dev: "development/",

		devDest: "development/app",

		devDestCss: "development/app/_public/styles/css",

		devMainCss: "development/app/main.css",

		fontDest: "build/app/_public/styles/fonts",

		imgDest: "build/app/_public/img",

		index: "index.html",

		templates: "build/app/templates.js",

		watchTS: ["app/**/*", "development/app/**/*"],

		watchLess: ["app/**/**/**", "development/app/**/**/**"]
	};
	return config;
};