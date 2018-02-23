const pkg = require('./package.json');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    'cryptobox.bundle': `${__dirname}/dist/commonjs/index.js`,
    'cryptobox.test.bundle': `${__dirname}/test/index.test.browser.js`,
  },
  externals: {
    dexie: 'Dexie',
    'fs-extra': '{}',
  },
  node: {
    fs: 'empty',
    path: 'empty',
  },
  output: {
    filename: `[name].js`,
    library: 'cryptobox',
    path: `${__dirname}/dist`,
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 36000,
    maxEntrypointSize: 36000,
  },
  plugins: [new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`)],
  target: 'web',
};
