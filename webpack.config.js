const webpack = require('webpack')
const fs = require('fs')
if (!fs.existsSync('./build')) {
  fs.mkdirSync('./build')
}
fs.writeFileSync('./build/index.html', `
  <body></body>
  <script src="distri.out.js"></script>
  `)

const importedCSS = JSON.stringify(fs.readFileSync('distri.css', 'utf8'))

module.exports = {
  entry: './distri.js',
  output: {
    path: `${__dirname}/build`,
    filename: 'distri.out.js'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      distriDefault: JSON.stringify('honeybee-hive-flarp-pyjamarama.c9users.io:8081'),
      distriSafeDatabases: JSON.stringify(['raw.githubusercontent.com/Flarp/Distri-Safe/master/safe.json']),
      importedCSS
    })
  ]
}
