module.exports = {
  devtool: 'cheap-module-source-map',
  devServer: {
    stats: {
      chunks: false,
    },
  },
  entry: {
    demo: `${__dirname}/src/demo/demo.js`,
    client: `${__dirname}/dist/commonjs/Client.js`,
    test: `${__dirname}/src/test/browser/index.js`,
  },
  externals: {
    'fs-extra': '{}',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: `[name].js`,
    publicPath: '/',
  },
};
