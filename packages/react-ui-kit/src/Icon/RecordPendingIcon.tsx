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

/** @jsx jsx */
import {jsx} from '@emotion/core';
import {SVGIcon, SVGIconProps} from './SVGIcon';

const RecordPendingIcon = (props: SVGIconProps) => (
  <SVGIcon realWidth={16} realHeight={16} {...props}>
    <defs>
      <path d="M4 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm-.5-4.5H6v1H3.5v-1zm0-2h1v3h-1v-3z" id="a"/>
    </defs>
    <g fill="none" fill-rule="evenodd" opacity=".4">
      <circle fill-opacity=".24" fill="#FB0807" cx="8" cy="8" r="8"/>
      <g transform="translate(4 4)">
        <mask id="b" fill="#fff">
        <use xlink:href="#a"/>
        </mask>
        <g mask="url(#b)" fill="#FB0807">
          <path d="M0 0h8v8H0z"/>
        </g>
      </g>
    </g>
  </SVGIcon>
);

export {RecordPendingIcon};
