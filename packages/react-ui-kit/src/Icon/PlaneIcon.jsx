/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

import IconBase from './IconBase';
import React from 'react';

class PlaneIcon extends IconBase {
  /* eslint-disable no-magic-numbers */
  width = 12;
  height = 12;
  renderSVG(width, height, color, style) {
    return (
      <svg width={width} height={height} style={style} viewBox="0 0 12 12">
        <path fill={color} d="M0 10.7c0 1 .8 1.6 1.8 1L11.3 7c1-.6 1-1.4 0-2L1.8.3C.8-.3 0 .3 0 1.3V6h9L0 7.5v3.2z" />
      </svg>
    );
  }
}

export {PlaneIcon};
