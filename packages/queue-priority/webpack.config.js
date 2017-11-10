module.exports = {
  devtool: 'cheap-module-source-map',
  devServer: {
    stats: {
      chunks: false,
    }
  },
  entry: {
    'test-bundle': `${__dirname}/src/test/browser/index.js`,
  },
  output: {
    path: `${__dirname}/dist`,
    filename: `[name].js`,
    publicPath: '/',
  }
};
