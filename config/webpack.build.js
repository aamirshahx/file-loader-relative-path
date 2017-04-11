import CleanWebpackPlugin from 'clean-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ChunkHashReplacePlugin from 'chunkhash-replace-webpack-plugin';
import ManifestPlugin from 'webpack-manifest-plugin';
import ReplaceStringPatternPlugin from 'replace-string-pattern-webpack-plugin';
import combineLoaders from 'webpack-combine-loaders';
import {extname} from 'path';
import {getAllFiles, modulesRoot, pathSeparator, root, staticRoot} from './helpers';

const appPath = root('css/');
const projectRootPath = root('.');
const modulesPath = modulesRoot();
const buildPath = staticRoot();

function generateEntryFileList() {
	let entry = {};
	getAllFiles('css/', '.pcss')
		.filter(filename => !(!filename.startsWith('_') && filename.indexOf(`${pathSeparator}_`) !== -1))
		.forEach(filename => {
			let absoluteFilename = filename.replace(extname(filename), '');
			let parentPath = absoluteFilename.split(pathSeparator);
			let cssPath = parentPath.join(pathSeparator);
			entry[cssPath] = `${projectRootPath}/${filename}`;
		});
	/*.forEach(filename => {
	 let relativeFilename = filename.split(pathSeparator).pop().split('.pcss')[0];
	 entry[relativeFilename] = `${projectRootPath}/${filename}`
	 });*/
	return entry;
}

export default (env) => {
	let proMode = env.toLowerCase() === 'production';

	return {
		devtool: proMode ? 'source-map' : 'eval',

		entry: generateEntryFileList(proMode),

		output: {
			path: buildPath,
			publicPath: buildPath,
			filename: proMode ? '[name].[chunkhash].css' : '[name].css',
			sourceMapFilename: proMode ? '[name].[chunkhash].map' : '[name].map'
		},

		resolve: {
			modules: [projectRootPath, modulesPath, root('images')],
			extensions: ['.pcss']
		},
		module: {
			rules: [
				{
					test: /\.(jpe?g|png|webp|svg|gif|cur)$/i,
					loader: 'file-loader',
					options: {

						/* // With Hardcoded Path
							// path of images in images/web/home/ are wrong

						name: '[path][name].[hash].[ext]',
						outputPath: '',
						publicPath: '../../'*/


						// With Relative Path
						// images are not appearing in build/images
						// instead the images with ../../ are in repo's parent directory and
						// images with ../../../ are in repo's parent's parent directory
						name: '[name].[hash].[ext]',
                        useRelativePath: true,
						publicPath: url => url

					}
				},
				{
					test: /\.pcss$/,
					loader: ExtractTextPlugin.extract({
						use: combineLoaders([
							{
								loader: 'css-loader',
								options: {
									importLoaders: 1,
									sourceMap: proMode,
									url: true
								}
							},
							{
								loader: 'postcss-loader',
								options: {
									sourceMap: proMode ? undefined : 'inline'
								}
							}
						])
					})
				}
			]
		},
		plugins: [
			...(env === 'watch' ? [] : [new CleanWebpackPlugin(['build'], {root: projectRootPath, verbose: true})]),
			new ExtractTextPlugin({filename: (proMode ? '[name].[chunkhash].css' : '[name].css'), allChunks: true}),
			new ManifestPlugin({fileName: 'css-manifest.json', stripContent: `css${pathSeparator}`})
		],
		stats: {
			assets: true,
			children: false,
			chunks: true,
			chunkModules: true,
			chunkOrigins: true,
			colors: true,
			errors: true,
			errorDetails: false,
			hash: false,
			modules: false,
			reasons: false,
			source: true,
			timings: true,
			version: true,
			warnings: true
		},
		node: {
			global: true,
			crypto: 'empty',
			process: true,
			module: false,
			clearImmediate: false,
			setImmediate: false
		}
	};
};

