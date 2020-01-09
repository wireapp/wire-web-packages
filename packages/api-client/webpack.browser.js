/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

const pkg = require('./package.json');
const path = require('path');
const webpack = require('webpack');

const projectName = pkg.name.replace('@wireapp/', '');
const camelCasedRepositoryName = 'wireWebApiClient';

module.exports = {
  devServer: {
    hot: true,
    open: true,
    overlay: true,
    stats: {
      chunks: false,
    },
  },
  devtool: 'source-map',
  entry: {
    [projectName]: `${__dirname}/${pkg.main}`,
    [`${projectName}.demo`]: `${__dirname}/demo/demo.js`,
  },
  externals: {
    'fs-extra': '{}',
  },
  mode: 'production',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        test: /\.[tj]s$/,
      },
    ],
  },
  output: {
    filename: `[name].bundle.js`,
    library: `${camelCasedRepositoryName}`,
    path: `${__dirname}/dist`,
  },
  plugins: [new webpack.BannerPlugin(`${pkg.name} v${pkg.version}`)],
  resolve: {
    alias: {
      '@wireapp/react-ui-kit': path.resolve(__dirname, '..', 'react-ui-kit', 'dist'),
    },
    extensions: ['.js', '.ts', '.jsx'],
  },
};
