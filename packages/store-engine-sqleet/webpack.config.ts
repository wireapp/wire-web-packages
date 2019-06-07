/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import webpack from 'webpack';

const defaultConfig: webpack.Configuration = {
  externals: {
    dexie: 'Dexie',
    'fs-extra': '{}',
  },
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        test: /\.[jt]s$/,
      },
    ],
  },
  node: {
    fs: 'empty',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
};

const nodeConfig = {
  ...defaultConfig,
  ...{
    output: {
      filename: 'SQLeetEngine.node.js',
      path: `${__dirname}/dist`,
    },
    target: 'node',
  },
};

const webConfig = {
  ...defaultConfig,
  ...{
    output: {
      filename: 'SQLeetEngine.web.js',
      library: 'StoreEngine',
      path: `${__dirname}/dist`,
    },
    target: 'web',
  },
};

module.exports = [nodeConfig, webConfig];
