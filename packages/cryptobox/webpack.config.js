const pkg = require('./package.json');
const webpack = require('webpack');
console.log('name', pkg.name);

module.exports = {
  devtool: 'source-map',
  entry: {
    filename: `${__dirname}/dist/commonjs/${pkg.name}.js`,
  },
  externals: {
    bazinga64: true,
    dexie: 'Dexie',
    'fs-extra': false,
    logdown: 'Logdown',
    'wire-webapp-lru-cache': 'LRUCache',
    'wire-webapp-proteus': 'Proteus',
  },
  node: {
    fs: 'empty',
    path: 'empty',
  },
  output: {
    filename: `${pkg.name}.js`,
    library: 'cryptobox',
    path: `${__dirname}/dist/window`,
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 100,
    maxEntrypointSize: 300,
  },
  plugins: [new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`)],
  target: 'web',
};
