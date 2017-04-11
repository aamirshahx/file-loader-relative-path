const fs = require('fs');
const path = require('path');
const helpers = require('../config/helpers');

function getDirs(srcPath) {
	return fs
		.readdirSync(srcPath)
		.filter(file => fs.statSync(path.join(srcPath, file)).isDirectory())
		.map(file => path.join(srcPath, file));
}

function pathMatcher(file) {
	let matched = getDirs(helpers.root('css')).indexOf(file) > -1;
	if (!matched && file.length > 0) {
		file = path.join(path.dirname(file + '../'));
		return pathMatcher(file);
	} else if (!matched) {
		return undefined;
	} else {
		return file;
	}
}

let processors = (ctx) => {
	let cssNext = {
		browsers: ['defaults', 'ie >= 9']
	}, lost = {
		gutter: '20px',
		flexbox: 'no-flex',
		cycle: 'auto',
		clearing: 'left'
	}, partialImport = {
		extension: ".pcss",
		prefix: '_'
	}, reporter = {
		clearMessages: true
	}, rucksackCss = {
		fallbacks: false,
		autoprefixer: false
	};

	let context = pathMatcher(ctx.webpack._module.context).split(helpers.pathSeparator).pop();
	let desktop = context === 'desktop',
		web = context === 'web';

	return [
		require("postcss-partial-import")(partialImport),
		require("postcss-mixins"),
		require("postcss-advanced-variables"),
		require("postcss-custom-selectors"),
		require("postcss-custom-media"),
		require("postcss-custom-properties"),
		require("postcss-media-minmax"),
		require("postcss-color-function"),
		require("postcss-atroot"),
		require("postcss-nesting"),
		require("postcss-nested"),
		require("postcss-property-lookup"),
		require("postcss-selector-matches"),
		require("postcss-selector-not"),
		require('postcss-center'),
		require('postcss-triangle'),
		require('postcss-short'),
		require('lost')(lost),
		require('rucksack-css')(rucksackCss),
		require('postcss-cssnext')(cssNext),
		require('postcss-discard-comments'),
		require('postcss-round-subpixels'),
		require("postcss-reporter")(reporter)
	];
};

module.exports = (ctx) => ({plugins: processors(ctx)});
