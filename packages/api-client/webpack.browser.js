const pkg = require('./package.json');
const webpack = require('webpack');

let repositoryName = pkg.repository.url.substr(pkg.repository.url.lastIndexOf('/') + 1);
repositoryName = repositoryName.substr(0, repositoryName.indexOf('.git'));

const camelCasedRepositoryName = repositoryName.replace(/-([a-z])/g, glob => glob[1].toUpperCase());

module.exports = {
  entry: {
    client: `${__dirname}/dist/commonjs/Client.js`,
  },
  externals: {
    dexie: 'Dexie',
    'fs-extra': '{}',
  },
  output: {
    filename: `${repositoryName}.min.js`,
    library: `${camelCasedRepositoryName}`,
    path: `${__dirname}/dist`,
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({output: {comments: false}}),
    new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`),
  ],
  target: 'web',
};
