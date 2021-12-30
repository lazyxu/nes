const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const ROOT_PATH = path.resolve(__dirname);
const BUILD_PATH = path.resolve(ROOT_PATH, './public/js');
function resolve(dir) {
    return path.join(__dirname, '..', dir)
}
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
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('node_modules/webpack-dev-server/client')]
            },
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true,
            cache: false,
            parallel: true,
            uglifyOptions: {
                warnings: false
            }
        })
    ]
};
