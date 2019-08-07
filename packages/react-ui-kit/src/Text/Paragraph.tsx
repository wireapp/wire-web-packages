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
import {Theme} from '../Layout';
import {QueryKeys, media} from '../mediaQueries';
import {TextProps, filterTextProps, textStyle} from './Text';

export type ParagraphProps<T = HTMLParagraphElement> = TextProps<T>;

export const paragraphStyle: <T>(theme: Theme, props: ParagraphProps<T>) => ObjectInterpolation<undefined> = (
  theme,
  {block = true, ...props},
) => ({
  ...textStyle(theme, {block, ...props}),
  marginBottom: '16px',
  marginTop: 0,
});

export const Paragraph = (props: ParagraphProps) => (
  <p css={theme => paragraphStyle(theme, props)} {...filterTextProps(props)} />
);

export type LeadProps<T = HTMLParagraphElement> = TextProps<T>;

export const leadStyle: <T>(theme: Theme, props: LeadProps<T>) => ObjectInterpolation<undefined> = (
  theme,
  {block = true, center = true, fontSize = '24px', ...props},
) => ({
  ...textStyle(theme, {block, center, fontSize, ...props}),
  marginBottom: '56px',
  marginTop: 0,
  [media[QueryKeys.MOBILE]]: {
    fontSize: '20px',
  },
});

export const Lead = (props: LeadProps) => <p css={theme => leadStyle(theme, props)} {...filterTextProps(props)} />;
