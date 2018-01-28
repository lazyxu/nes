var path = require('path');
var webpack = require('webpack');

var ROOT_PATH = path.resolve(__dirname);
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
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
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
