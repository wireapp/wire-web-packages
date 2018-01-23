const pkg = require('./package.json');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    filename: `./dist/commonjs/LRUCache.js`,
  },
  output: {
    filename: `LRUCache.js`,
    library: 'LRUCache',
    path: './dist/window',
  },
  plugins: [new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`)],
  target: 'node',
};
