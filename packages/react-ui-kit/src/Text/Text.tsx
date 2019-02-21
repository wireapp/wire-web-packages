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
import {ObjectInterpolation} from '@emotion/styled';
import {TextTransformProperty} from 'csstype';
import {COLOR} from '../Identity';

export interface TextProps<T = HTMLSpanElement> extends React.HTMLProps<T> {
  block?: boolean;
  bold?: boolean;
  center?: boolean;
  color?: string;
  fontSize?: string;
  light?: boolean;
  muted?: boolean;
  noWrap?: boolean;
  textTransform?: TextTransformProperty;
  truncate?: boolean;
}

export const textStyles: (props: TextProps) => ObjectInterpolation<undefined> = props => ({
  color: props.color,
  display: props.block ? 'block' : 'inline',
  fontSize: props.fontSize,
  fontWeight: props.bold ? 600 : props.light ? 200 : 300,
  opacity: props.muted ? 0.56 : 1,
  overflow: props.truncate ? 'hidden' : undefined,
  textAlign: props.center ? 'center' : 'left',
  textOverflow: props.truncate ? 'ellipsis' : undefined,
  textTransform: props.textTransform,
  whiteSpace: props.noWrap ? 'nowrap' : undefined,
});

const Text = ({
  block = false,
  bold = false,
  center = false,
  color = COLOR.TEXT,
  fontSize = '16px',
  light = false,
  muted = false,
  noWrap = false,
  textTransform = 'none',
  truncate = false,
  ...props
}: TextProps) => (
  <span
    css={textStyles({
      block,
      bold,
      center,
      color,
      fontSize,
      light,
      muted,
      noWrap,
      textTransform,
      truncate,
      ...props,
    })}
    {...props}
  />
);

const Bold = (props: TextProps) => <Text bold {...props} />;
const Small = (props: TextProps) => <Text fontSize={'12px'} {...props} />;
const Muted = (props: TextProps) => <Text muted {...props} />;
const Uppercase = (props: TextProps) => <Text textTransform={'uppercase'} {...props} />;
const Large = (props: TextProps) => <Text fontSize={'48px'} light {...props} />;

export {Bold, Muted, Small, Text, Uppercase, Large};
