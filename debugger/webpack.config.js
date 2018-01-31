var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, '../public/js/');

module.exports = {
    entry: {
        debugger: './src/App.jsx',
        react: [
            'react',
            'react-router-dom',
            'react-redux',
            'redux',
            'react-dom'
        ]
    },
    output: {
        path: BUILD_PATH,
        filename: '[name].js',
        publicPath: '/js/'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['babel'],
                include: APP_PATH
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass']
            }
        ]
    },
    devtool: 'eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'NES Emulator Debugger',
            filename: '../debugger.html',
            // template: 'index.html' // 模板路径
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["react", 'manifest'],
            minChunks: Infinity,
        }),
        // new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoErrorsPlugin(),
        // new webpack.optimize.UglifyJsPlugin({
        //     output: {
        //         comments: false,  // remove all comments
        //     },
        //     compress: {
        //         warnings: false
        //     }
        // }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development")
            }
        })
        // new webpack.DefinePlugin({
        //     "process.env": {
        //         NODE_ENV: JSON.stringify("production")
        //     }
        // })
    ]
}
