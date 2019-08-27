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

export interface Rotation {
  right: number;
  down: number;
  left: number;
  up: number;
}

export interface ArrowProps extends SVGIconProps {
  direction?: keyof Rotation;
}

/* tslint:disable:object-literal-sort-keys */
const rotation: Rotation = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};
/* tslint:enable:object-literal-sort-keys */

export const Arrow2Icon = ({direction = 'right', ...props}: ArrowProps) => (
  <SVGIcon realWidth={5} realHeight={8} {...props}>
    <path transform={`rotate(${rotation[direction]} 8 8)`} d="M0 .92L.94 0 5 4 .94 8 0 7.08 3.13 4z" />
  </SVGIcon>
);
