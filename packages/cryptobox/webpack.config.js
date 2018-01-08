const pkg = require('./package.json');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    filename: `${__dirname}/dist/commonjs/${pkg.name}.js`
  },
  output: {
    filename: `${pkg.name}.js`,
    library: 'cryptobox',
    path: `${__dirname}/dist/window`
  },
  externals: {
    'bazinga64': true,
    'dexie': 'Dexie',
    'logdown': 'Logdown',
    'fs-extra': false,
    'wire-webapp-lru-cache': 'LRUCache',
    'wire-webapp-proteus': 'Proteus'
  },
  node: {
    fs: 'empty',
    path: 'empty'
  },
  plugins: [
    new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`)
  ],
  performance: {
    maxAssetSize: 100,
    maxEntrypointSize: 300,
    hints: 'warning'
  },
  target: 'web'
};
