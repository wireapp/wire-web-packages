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
import Color from 'color';
import React from 'react';
import {COLOR} from '../Identity';
import {defaultTransition} from '../Identity/motions';
import {TextProps, textStyles} from './Text';

export interface LinkProps extends TextProps {
  component?: React.ComponentType | string;
}

export const linkStyles = props => {
  const darker = 0.16;
  const hoverColor = Color(props.color)
    .mix(Color(COLOR.BLACK), darker)
    .toString();
  return {
    ...textStyles(props),
    // ${defaultTransition};
    '&:hover': {
      color: hoverColor,
    },
    '&:visited, &:link, &:active': {
      color: props.color,
    },
    color: props.color,
    cursor: 'pointer',
    textDecoration: 'none',
  };
};

const Link = ({component = 'a', ...props}: LinkProps) =>
  React.createElement(component, {css: linkStyles(props), ...props} as any, null);

//TODO default props

export {Link};
