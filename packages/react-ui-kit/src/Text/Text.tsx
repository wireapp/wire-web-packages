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

import * as React from 'react';
import {defaultProps} from 'recompose';
import styled from 'styled-components';
import {COLOR} from '../Identity';

export interface TextProps {
  block?: boolean;
  bold?: boolean;
  center?: boolean;
  color?: string;
  fontSize?: string;
  light?: boolean;
  muted?: boolean;
  noWrap?: boolean;
  textTransform?: string;
  truncate?: boolean;
}

const Text = styled.span<TextProps & React.HTMLAttributes<HTMLSpanElement>>`
  color: ${props => props.color};
  font-size: ${props => props.fontSize};
  font-weight: ${props => (props.bold ? '600' : props.light ? '200' : '300')};
  opacity: ${props => (props.muted ? '0.56' : '1')};
  text-align: ${props => (props.center ? 'center' : 'left')};
  text-transform: ${props => props.textTransform};
  display: ${props => (props.block ? 'block' : 'inline')};
  ${props => props.noWrap && 'white-space: nowrap;'};
  ${props =>
    props.truncate &&
    `
        overflow: hidden;
        text-overflow: ellipsis;
      `};
`;

Text.defaultProps = {
  block: false,
  bold: false,
  center: false,
  color: COLOR.TEXT,
  fontSize: '16px',
  light: false,
  muted: false,
  noWrap: false,
  textTransform: 'none',
  truncate: false,
};

const Bold = defaultProps<TextProps & React.HTMLAttributes<HTMLSpanElement>>({bold: true})(Text);
const Small = defaultProps<TextProps & React.HTMLAttributes<HTMLSpanElement>>({fontSize: '12px'})(Text);
const Muted = defaultProps<TextProps & React.HTMLAttributes<HTMLSpanElement>>({muted: true})(Text);
const Uppercase = defaultProps<TextProps & React.HTMLAttributes<HTMLSpanElement>>({textTransform: 'uppercase'})(Text);
const Large = defaultProps<TextProps & React.HTMLAttributes<HTMLSpanElement>>({fontSize: '48px', light: true})(Text);

export {Bold, Muted, Small, Text, Uppercase, Large};
