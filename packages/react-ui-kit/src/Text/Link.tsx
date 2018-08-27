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
import * as Color from 'color';
import {COLOR} from '../Identity';
import {Text, TextProps} from './Text';
import {defaultTransition} from '../Identity/motions';

interface LinkProps extends TextProps {
  color: any;
  component: string;
};

const Link: React.SFC<LinkProps> = ({color, component, ...props}) => {
  const darker = 0.16;
  const hoverColor = Color(color)
    .mix(Color(COLOR.BLACK), darker)
    .toString();
  const StyledLink = Text.withComponent(component as any).extend`
    text-decoration: none;
    ${defaultTransition}
    cursor: pointer;
    color: ${color};

    &:visited,
    &:link,
    &:active {
      color: ${color};
    }
    &:hover {
      color: ${hoverColor};
    }
  `;
  return <StyledLink {...props} />;
};

Link.defaultProps = {
  ...Link.defaultProps,
  bold: true,
  color: COLOR.LINK,
  component: 'a',
  fontSize: '11px',
  textTransform: 'uppercase',
};

export {Link};
