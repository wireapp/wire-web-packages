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

import {ForwardedRef, forwardRef, HTMLAttributes} from 'react';

import {CSSObject} from '@emotion/react';
import type {Property} from 'csstype';

import {COLOR} from '../Identity';
import {Theme} from '../Layout';
import {filterProps} from '../util';

export interface TextProps<T = HTMLSpanElement> extends HTMLAttributes<T> {
  block?: boolean;
  bold?: boolean;
  center?: boolean;
  color?: string;
  fontSize?: string;
  light?: boolean;
  muted?: boolean;
  noWrap?: boolean;
  textTransform?: Property.TextTransform;
  truncate?: boolean;
  disabled?: boolean;
  ref?: ForwardedRef<T>;
}
export type Ref = HTMLSpanElement;

export const filterTextProps = (props: TextProps) => {
  return filterProps(props, [
    'block',
    'bold',
    'center',
    'color',
    'fontSize',
    'light',
    'muted',
    'noWrap',
    'textTransform',
    'truncate',
  ]);
};

export const textStyle: <T>(theme: Theme, props: TextProps<T>) => CSSObject = (
  theme,
  {
    block = false,
    bold = false,
    center = false,
    color = theme.general.color,
    fontSize = '16px',
    light = false,
    muted = false,
    noWrap = false,
    textTransform = 'none',
    truncate = false,
  },
) => ({
  color: muted ? COLOR.GRAY : color,
  display: block ? 'block' : 'inline',
  fontSize: fontSize,
  fontWeight: bold ? 600 : light ? 200 : 300,
  overflow: truncate ? 'hidden' : undefined,
  textAlign: center ? 'center' : 'left',
  textOverflow: truncate ? 'ellipsis' : undefined,
  textTransform: textTransform,
  whiteSpace: noWrap ? 'nowrap' : undefined,
});

const TextInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => (
  <span ref={ref} css={(theme: Theme) => textStyle(theme, props)} {...filterTextProps(props)} />
);
const BoldInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => <Text {...props} ref={ref} bold />;
const SmallInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => (
  <Text {...props} ref={ref} fontSize={'12px'} />
);
const MutedInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => <Text {...props} ref={ref} muted />;
const UppercaseInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => (
  <Text {...props} ref={ref} textTransform={'uppercase'} />
);
const LargeInner = (props: TextProps, ref: ForwardedRef<HTMLSpanElement>) => (
  <Text {...props} ref={ref} fontSize={'48px'} light />
);

// use forwardRef to pass the ref to the underlying DOM element
const Text = forwardRef<HTMLSpanElement, TextProps>(TextInner);
const Bold = forwardRef<HTMLSpanElement, TextProps>(BoldInner);
const Small = forwardRef<HTMLSpanElement, TextProps>(SmallInner);
const Muted = forwardRef<HTMLSpanElement, TextProps>(MutedInner);
const Uppercase = forwardRef<HTMLSpanElement, TextProps>(UppercaseInner);
const Large = forwardRef<HTMLSpanElement, TextProps>(LargeInner);

export {Text, Bold, Small, Muted, Uppercase, Large};
