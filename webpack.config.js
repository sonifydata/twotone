/* eslint-env node, browser: false */

const DEBUG_SERVICE_WORKER = false;

// Variables in .env will be added to process.env
require('dotenv').config();

const webpack = require('webpack');
const env = process.env.NODE_ENV || 'development';
const path = require('path');
const fs = require('fs');
const merge = require('webpack-merge');

process.traceDeprecation = false;

// webpack plugins and related utils
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const InjectManifestPlugin = require('./tools/inject-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
// const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
// const { UnusedFilesWebpackPlugin } = require('unused-files-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const autoprefixer = require('autoprefixer');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// configuration
const title = 'TwoTone';
const websiteURL = 'https://twotone.io';
const description = 'TwoTone Data Sonification';
const eslintConfig = require('./.eslintrc.json');
const port = '9000';
const browserslist = [
	'>0.25%',
	'last 4 versions',
	'Firefox ESR',
	'ie >= 12', // Web Audio API starts here
	'not dead'
];
const mediaFilesRegex = /\.(?:webm|ogg|oga|mp3|wav|aiff|flac|mp4|m4a|aac|opus|webp)$/;

const babelPlugins = env === 'development' ? [
	'react-hot-loader/babel',

	// Adds component stack to warning messages
	require.resolve('@babel/plugin-transform-react-jsx-source'),

	// Adds __self attribute to JSX which React will use for some warnings
	require.resolve('@babel/plugin-transform-react-jsx-self')
] : [];

const nodeModulesRegex = /node_modules\//;
const babelTranspileWhitelist = [
	'react-mic-record',
	'soundq'
];

const VERSION = (() => {
	let timestamp = new Date().toISOString();
	try {
		const spawn = require('child_process')
			.spawnSync('git', ['show', '-s', '--format=%cD', 'HEAD']);
		const errorText = spawn.stderr.toString().trim();
		if (errorText) {
			console.warn('git timestamp error', errorText);
		} else {
			const timeString = spawn.stdout.toString().trim();
			const time = new Date(timeString);
			timestamp = time.toISOString();
		}
	} catch (e) {
		console.warn('timestamp error', e && e.message, e);
	}

	let version = 'dev';
	try {
		const spawn = require('child_process')
			.spawnSync('git', ['rev-parse', '--short', 'HEAD']);
		const errorText = spawn.stderr.toString().trim();
		if (errorText) {
			console.warn('git version error', errorText);
		} else {
			version = spawn.stdout.toString().trim();
		}
	} catch (e) {}

	return JSON.stringify(`${timestamp} ${version}`);
})();

const plugins = [
	new CaseSensitivePathsPlugin(),
	new CleanWebpackPlugin()
];

const config = {
	entry: './src/index.js',
	devtool: 'source-map',
	output: {
		path: __dirname + '/build',
		filename: 'index-[hash].js',
		pathinfo: env !== 'production',
		globalObject: 'this'
		// publicPath: __dirname + '/public'
	},
	module: {
		rules: [
			// preLoaders
			{
				test: /(\.jsx|\.js)$/,
				exclude: /node_modules/,
				enforce: 'pre',
				loader: 'eslint-loader',
				options: Object.assign({}, eslintConfig, {
					formatter: eslintFormatter,
					failOnHint: env === 'production',
					emitWarning: true,
					parserOptions: {
						ecmaFeatures: {
							jsx: true
						}
					},
				})
			},

			{
				oneOf: [
					// 'url' loader works like 'file' loader except that it embeds assets
					// smaller than specified limit in bytes as data URLs to avoid requests.
					// A missing `test` is equivalent to a match.
					{
						test: [/\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/, /\.mp3$/],
						loader: require.resolve('url-loader'),
						options: {
							limit: 10000,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					},

					// Process JS with babel
					{
						test: /(\.jsx|\.js)$/,
						exclude(path) {
							/*
							whitelist some dependencies that need to be transpiled
							*/
							const index = path.search(nodeModulesRegex);
							if (index >= 0) {
								const rest = path.slice(index + 'node_modules/'.length);
								if (!babelTranspileWhitelist.some(name => rest.startsWith(name))) {
									return true;
								}
							}
							return false;
						},
						loader: 'babel-loader',
						options: {
							// babelrc: false,
							presets: [
								[
									'@babel/env',
									{
										exclude: [
											'transform-regenerator',
											'transform-async-to-generator'
										],
										targets: {
											browsers: browserslist
										},
										useBuiltIns: false,
										modules: false
									}
								],
								['@babel/react']
							],
							plugins: [
								...babelPlugins,
								'@babel/plugin-proposal-class-properties',
								['@babel/plugin-syntax-jsx'],
								['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
								['@babel/plugin-transform-react-jsx', { useBuiltIns: true }],
								['@babel/plugin-transform-runtime', {
									helpers: false,
									regenerator: true
								}],
								'@babel/plugin-syntax-dynamic-import',
								'module:fast-async',

								// todo: for tests
								// https://github.com/facebookincubator/create-react-app/blob/master/packages/babel-preset-react-app/index.js#L72

								['transform-react-remove-prop-types', {
									removeImport: true
								}]
							],
							cacheDirectory: true
						}
					},

					// 'postcss' loader applies autoprefixer to our CSS.
					// 'css' loader resolves paths in CSS and adds assets as dependencies.
					// 'style' loader turns CSS into JS modules that inject <style> tags.
					// In production, we use a plugin to extract that CSS to a file, but
					// in development 'style' loader enables hot editing of CSS.
					{
						test: /\.css$/,
						use: [
							require.resolve('style-loader'),
							// {
							// 	loader: require.resolve('css-loader'),
							// 	options: {
							// 		importLoaders: 1
							// 	}
							// },
							{
								loader: require.resolve('postcss-loader'),
								options: {
									// Necessary for external CSS imports to work
									// https://github.com/facebookincubator/create-react-app/issues/2677
									ident: 'postcss',
									plugins: () => [
										require('postcss-flexbugs-fixes'),
										autoprefixer({
											flexbox: 'no-2009'
										})
									]
								}
							}
						]
					},

					// 'file' loader makes sure those assets get served by WebpackDevServer.
					// When you `import` an asset, you get its (virtual) filename.
					// In production, they would get copied to the `build` folder.
					// This loader doesn't use a 'test' so it will catch all modules
					// that fall through the other loaders.
					{
						// Exclude `js` files to keep 'css' loader working as it injects
						// its runtime that would otherwise processed through 'file' loader.
						// Also exclude `html` and `json` extensions so they get processed
						// by webpacks internal loaders.
						exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
						loader: require.resolve('file-loader'),
						options: {
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
				]
			}
		]
	},
	plugins,
	node: {
		fs: 'empty'
	},
	optimization: {
		namedModules: true,
		splitChunks: {
			minChunks: 2
		}
	},
	performance: {
		assetFilter: assetFilename => !mediaFilesRegex.test(assetFilename) &&
			!assetFilename.endsWith('.map')
	}
};

const serviceWorkerPlugin = new WorkboxPlugin.GenerateSW({
	swDest: 'sw.js',
	exclude: [
		/\.map$/, // source maps
		/^manifest.*\.js(?:on)?$/, // web app manifest
		/icons-[a-z0-9]+\/[a-z0-9_-]+\.png$/, // icons
		/icons-[a-z0-9]+\/\.cache$/, // favicons cache file
		/node_modules\/standardized-audio-context\//,
		mediaFilesRegex // media files
	],
	skipWaiting: true,
	clientsClaim: true,
	cleanupOutdatedCaches: true,
	runtimeCaching: [{
		urlPattern: mediaFilesRegex,
		handler: 'CacheFirst',
		options: {}
	}]
});


const devConfig = {
	entry: [
		'react-hot-loader/patch', // RHL patch
		'./src/index.js'
	],
	mode: 'development',
	devtool: 'cheap-module-source-map',
	output: {
		// workaround for https://github.com/facebookincubator/create-react-app/issues/2407
		sourceMapFilename: '[file].map'
	},
	resolve: {
		// root: path.resolve('./src'),
		extensions: ['.js', '.jsx'],
		alias: {
			// workaround for https://github.com/aadsm/jsmediatags/issues/116
			jsmediatags: 'jsmediatags/dist/jsmediatags.min.js',

			'react-dom': '@hot-loader/react-dom',
			'@material-ui/core': path.resolve(__dirname, 'node_modules/@material-ui/core/es/')
			// We can restore this later if we solve issue #11
			// 'preact-compat': 'preact-compat/dist/preact-compat',
			// react: 'preact-compat/dist/preact-compat',
			// 'react-dom': 'preact-compat/dist/preact-compat'
		}
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
			DEBUG: true,
			DEBUG_SERVICE_WORKER,
			COMMIT_HASH: `'dev'`,
			APP_TITLE: JSON.stringify(title),
			APP_WEBSITE_URL: JSON.stringify(websiteURL),
			SPEECH_API_KEY: JSON.stringify(process.env.SPEECH_API_KEY)
		}),
		new WebpackBuildNotifierPlugin({
			title: path.basename(__dirname),
			suppressSuccess: true
		}),
		new webpack.HotModuleReplacementPlugin(),

	//	new WatchMissingNodeModulesPlugin(resolveApp('node_modules')),

		new HtmlWebpackPlugin({
			inject: true,
			ga: false,
			title,
			description,
			template: __dirname + '/public/index.html'
		})
	],
	devServer: {
		hot: true,
		progress: true,
		inline: true,
		// historyApiFallback: {
		// 	index: '/'
		// },
		contentBase: './public',
		stats: {
			all: false,
			colors: true,
			errors: true,
			warnings: true
		},
		port,
		host: '127.0.0.1'
	}
};

if (DEBUG_SERVICE_WORKER) {
	process.traceDeprecation = true;
	devConfig.plugins.push(serviceWorkerPlugin);
}

const distConfig = {
	output: {
		filename: 'index-[chunkhash].js'
	},
	mode: 'production',
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			// workaround for https://github.com/aadsm/jsmediatags/issues/116
			jsmediatags: 'jsmediatags/dist/jsmediatags.min.js'
		}
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
			DEBUG: false,
			DEBUG_SERVICE_WORKER: false,
			COMMIT_HASH: VERSION,
			APP_TITLE: JSON.stringify(title),
			APP_WEBSITE_URL: JSON.stringify(websiteURL),
			SPEECH_API_KEY: JSON.stringify(process.env.SPEECH_API_KEY)
		}),
		new FaviconsWebpackPlugin({
			logo: resolveApp('./src/images/two-tone-logo.svg'),
			background: '#303030',
			persistentCache: true,
			version: VERSION,
			title: 'TwoTone',
			appDescription: description
		}),
		new ImageminPlugin({
			svgo: {
			},
			// pngquant is not run unless you pass options here
			// pngquant: null,
			plugins: [
				imageminMozjpeg({
					quality: 80
				})
			]
		}),
		new CopyWebpackPlugin( {

			//the from option now can only be a string, if you use { from: { glob: 'directory/**', dot: false } } changed it to { from: 'directory/**', globOptions: { dot: false } }
			// from: __dirname + '/public',
			// to: __dirname + '/build',
			//ignore: ['index.html']
			      patterns: [
			        { from: (__dirname + '/public'), to: (__dirname + '/build') },
			      ]}),
		new HtmlWebpackPlugin({
			inject: true,
			template: __dirname + '/public/index.html',
			ga: process.env.GOOGLE_ANALYTICS_KEY || '',
			title,
			description,
			minify: {
				removeComments: true,
				// removeCommentsFromCDATA: true,
				// removeCDATASectionsFromCDATA: true,
				// collapseWhitespace: true,
				//	collapseBooleanAttributes: true,
				//	removeAttributeQuotes: true,
				//	removeRedundantAttributes: true,
				// useShortDoctype: true,
				//	removeEmptyAttributes: true,
				//	removeScriptTypeAttributes: true,
				// lint: true,
				caseSensitive: true,
				//minifyJS: true,
				//minifyCSS: true
			}
		}),
		// CAV: might remove this...?
		// don't know what it is
		new InjectManifestPlugin({
			theme_color: '#26c6da', // eslint-disable-line camelcase
			start_url: '../?utm_source=web_app_manifest', // eslint-disable-line camelcase
			name: title,
			description
		}),
		serviceWorkerPlugin,
		// CAV: removing this...
		// don't know what it is

		// new BundleAnalyzerPlugin({
		// 	openAnalyzer: false,
		// 	analyzerMode: 'static',
		// 	reportFilename: '../report.html'
		// })

		// new UnusedFilesWebpackPlugin({
		// 	patterns: [
		// 		'src/**/*.*',
		// 		'public/**/*.*'
		// 	]
		// })
	]
};

module.exports = merge.smart(config, env === 'production' ? distConfig : devConfig);
