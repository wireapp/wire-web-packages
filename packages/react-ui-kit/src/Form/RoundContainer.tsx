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

import {ObjectInterpolation, jsx} from '@emotion/core';
import {COLOR} from '../Identity';

export interface RoundContainerProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  color?: string;
  size?: number;
}

const roundContainerStyle: (props: RoundContainerProps) => ObjectInterpolation<undefined> = props => ({
  alignItems: 'center',
  backgroundColor: props.color,
  border: 'none',
  borderRadius: '50%',
  display: 'flex',
  height: `${props.size}px`,
  justifyContent: 'center',
  margin: '0 auto',
  width: `${props.size}px`,
});

const RoundContainer = ({color = COLOR.BLUE, size = 72, ...props}: RoundContainerProps) => (
  <div css={roundContainerStyle({color, size, ...props})} {...props} />
);

export {roundContainerStyle, RoundContainer};
