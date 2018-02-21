module.exports = {
  devServer: {
    stats: {
      chunks: false,
    },
  },
  devtool: 'cheap-module-source-map',
  entry: {
    'demo-bundle': `${__dirname}/src/demo/index.js`,
    'test-bundle': `${__dirname}/src/main/index.test.browser.js`,
  },
  externals: {
    'fs-extra': '{}',
  },
  node: {
    path: 'empty',
  },
  output: {
    filename: `[name].js`,
    path: `${__dirname}/dist`,
    publicPath: '/',
  },
};
