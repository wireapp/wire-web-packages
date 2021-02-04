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

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './Root';

const main = document.createElement('div');
main.id = 'main';
document.body.appendChild(main);

const render = (Component: any) => {
  ReactDOM.render(<Component />, document.getElementById('main'));
};

runApp();
function runApp() {
  render(Root);
  if (module.hot) {
    module.hot.accept('./Root', () => {
      const NextApp = require('./Root').default;
      render(NextApp);
    });
  }
}
