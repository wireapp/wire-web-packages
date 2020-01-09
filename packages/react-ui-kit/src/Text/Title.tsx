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
import {Theme} from '../Layout';
import {TextProps, filterTextProps, textStyle} from './Text';

export type TitleProps<T = HTMLDivElement> = TextProps<T>;

const titleStyle: <T>(theme: Theme, props: TitleProps<T>) => ObjectInterpolation<undefined> = (
  theme,
  {block = true, center = true, fontSize = '32px', color = COLOR.GRAY, bold = true, ...props},
) => ({
  ...textStyle(theme, {block, bold, center, color, fontSize, ...props}),
  marginBottom: '8px',
});

export const Title = (props: TitleProps) => <div css={theme => titleStyle(theme, props)} {...filterTextProps(props)} />;
