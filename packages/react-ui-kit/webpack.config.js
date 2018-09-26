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

const path = require('path');
const webpack = require('webpack');

const DEMO_DIR = path.resolve(__dirname, 'demo');

module.exports = {
  devServer: {
    contentBase: DEMO_DIR,
    hot: true,
    hotOnly: true,
    open: true,
    overlay: true,
  },
  devtool: 'source-map',
  entry: {
    bundle: ['react-hot-loader/patch', DEMO_DIR + '/index.jsx'],
  },
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        test: /\.(js|ts)x?$/,
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: DEMO_DIR,
  },
  plugins: [new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin()],
  resolve: {
    alias: {
      '@wireapp/react-ui-kit': path.resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};
