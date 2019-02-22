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

/** @jsx jsx */
import {ObjectInterpolation, jsx} from '@emotion/core';
import {FlexWrapProperty} from 'csstype';

export interface FlexBoxProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  align?: string;
  column?: boolean;
  justify?: string;
  flexWrap?: FlexWrapProperty;
}

const flexBoxStyles: (props: FlexBoxProps) => ObjectInterpolation<undefined> = ({
  align = 'flex-start',
  column = false,
  justify = 'flex-start',
  flexWrap = 'nowrap',
}) => ({
  alignItems: align,
  display: 'flex',
  flexDirection: column ? 'column' : 'row',
  flexWrap: flexWrap,
  justifyContent: justify,
});

const FlexBox = (props: FlexBoxProps) => <div css={flexBoxStyles(props)} {...props} />;

export {FlexBox, flexBoxStyles};
