/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import {Switch} from './Switch';

import {THEME_ID} from '../../Identity';
import {matchComponent} from '../../utils/testUtil';

/* eslint-disable jest/expect-expect */

describe('"Switch"', () => {
  it('renders unchecked', () => matchComponent(<Switch id="1" checked={false} onToggle={() => {}} />));
  it('renders checked', () => matchComponent(<Switch id="2" checked onToggle={() => {}} />));
  it('renders (dark theme)', () =>
    matchComponent(<Switch id="3" checked={false} onToggle={() => {}} />, THEME_ID.DARK));
  it('renders disabled', () => matchComponent(<Switch id="4" checked={false} onToggle={() => {}} disabled />));
});
