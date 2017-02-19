const webpack = require('webpack')

module.exports = {
  entry: './distri.js',
  output: {
    path: `${__dirname}/build`,
    filename: 'distri.min.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0'],
          plugins: ['transform-object-assign']
        } },
            { test: /\.js$/, loader: 'webpack-append', query: 'var _crypto;' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      distriDefault: JSON.stringify('honeybee-hive-flarp-pyjamarama.c9users.io:8081'),
      distriSafeDatabases: JSON.stringify(['raw.githubusercontent.com/Flarp/Distri-Safe/master/safe.json'])
    })
  ]
}
