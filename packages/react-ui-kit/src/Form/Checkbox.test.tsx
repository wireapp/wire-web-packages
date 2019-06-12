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

import React from 'react';
import {matchComponent} from '../test/testUtil';
import {Checkbox, CheckboxLabel} from './Checkbox';

describe('"Checkbox"', () => {
  it('renders', () => matchComponent(<Checkbox id="1">Check</Checkbox>));
  it('renders as invalid', () =>
    matchComponent(
      <Checkbox id="1" markInvalid>
        Check
      </Checkbox>
    ));
  it('renders disabled', () =>
    matchComponent(
      <Checkbox id="1" disabled>
        Check
      </Checkbox>
    ));
});

describe('"CheckboxLabel"', () => {
  it('renders', () => matchComponent(<CheckboxLabel>Label</CheckboxLabel>));
});
