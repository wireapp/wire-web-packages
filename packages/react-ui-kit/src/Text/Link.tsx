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
import {ObjectInterpolation, jsx} from '@emotion/core';
import Color from 'color';
import React from 'react';
import {COLOR} from '../Identity';
import {defaultTransition} from '../Identity/motions';
import {filterProps} from '../util';
import {TextProps, filterTextProps, textStyles} from './Text';

export interface LinkProps<T = HTMLAnchorElement> extends TextProps<T> {
  component?: React.ComponentType | string;
}

const linkStyles: (props: LinkProps) => ObjectInterpolation<undefined> = props => {
  const darker = 0.16;
  const hoverColor = Color(props.color)
    .mix(Color(COLOR.BLACK), darker)
    .toString();
  return {
    ...textStyles(props),
    '&:hover': {
      color: hoverColor,
    },
    '&:visited, &:link, &:active': {
      color: props.color,
    },
    color: props.color,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: defaultTransition,
  };
};

const filterLinkProps = (props: Object) => filterProps(filterTextProps(props), ['component']);

const Link = ({
  bold = true,
  color = COLOR.LINK,
  component = 'a',
  fontSize = '11px',
  textTransform = 'uppercase',
  children,
  ...props
}: LinkProps) =>
  jsx(
    component,
    {css: linkStyles({bold, color, component, fontSize, textTransform, ...props}), ...filterLinkProps(props)} as any,
    children
  );

export {Link, linkStyles, filterLinkProps};
