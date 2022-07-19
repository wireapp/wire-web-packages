/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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
import {DropFileInput} from './DropFileInput';

const defaultProps = {
  onInvalidFilesDropError: () => {},
  onFilesUploaded: () => {},
  headingText: 'Drag & Drop an image \nor',
  labelText: 'select one from your device',
  accept: 'image/png, image/jpeg',
  description: 'Image (JPG/PNG) size up to 1 MB, minimum 200 x 600 px',
};

describe('"Button"', () => {
  it('renders', () => matchComponent(<DropFileInput {...defaultProps} />));
});
