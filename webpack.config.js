var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, './public/js');

module.exports = {
    entry: {
        "nes": "./src/index.js",
        "nes.min": "./src/index.js"
    },
    output: {
        path: BUILD_PATH,
        publicPath: '/js/',
        filename: "[name].js",
        library: "nesEmulator",
        libraryTarget: "umd",
        umdNamedDefine: true
    },
    // module: {
    //     loaders: [
    //         {
    //             test: /\.js$/,
    //             enforce: "pre",
    //             exclude: /node_modules/,
    //             use: [
    //                 {
    //                     loader: "jshint-loader"
    //                 }
    //             ]
    //         }
    //     ]
    // },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        })
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ['manifest'],
        //     minChunks: Infinity
        // }),
        // new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoErrorsPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //   output: {
        //     comments: false,  // remove all comments
        //   },
        //   compress: {
        //     warnings: false
        //   }
        // }),
        // new webpack.DefinePlugin({
        //     "process.env": {
        //         NODE_ENV: JSON.stringify("production")
        //     }
        // })
    ]
};
