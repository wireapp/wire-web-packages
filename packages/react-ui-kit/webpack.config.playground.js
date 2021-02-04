/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

const commonConfig = require('./webpack.config');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const src = 'src/playground/';

module.exports = {
  ...commonConfig,
  devServer: {
    hot: true,
    hotOnly: true,
    open: true,
    overlay: true,
  },
  devtool: 'source-map',
  entry: {...commonConfig.entry, script: ['react-hot-loader/patch', path.resolve(__dirname, src, 'main.tsx')]},
  mode: 'development',
  plugins: [
    ...commonConfig.plugins,
    new HtmlWebpackPlugin({
      title: 'PassGen',
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, user-scalable=no',
        description: 'Playground',
      },
    }),
  ],
  resolve: {...commonConfig.resolve, alias: {...commonConfig.resolve.alias, 'react-dom': '@hot-loader/react-dom'}},
};
