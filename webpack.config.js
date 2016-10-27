const webpack = require('webpack')

module.exports = {
    entry: "./distri.js",
    output: {
        path: `${__dirname}/build`,
        filename: 'distri.min.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', query: {
                presets: ['es2015', 'stage-0', 'es2016'],
                plugins: ['transform-object-assign']
            } },
            {test: /\.js$/, loader: 'webpack-append', query: 'var _crypto;'},
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
            { test: /\.(woff|woff2)$/, loader:"url?prefix=font/&limit=5000" },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" }
            ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.DefinePlugin({
            distriDefault: JSON.stringify('Collatz Conjecture')
        })
        ]
}