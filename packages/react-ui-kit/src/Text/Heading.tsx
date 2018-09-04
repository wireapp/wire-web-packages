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
import styled from 'styled-components';
import {COLOR} from '../Identity';
import media from '../mediaQueries';
import {Text} from './Text';

interface HeadingProps {
  block?: boolean;
  bold?: boolean;
  center?: boolean;
  color?: string;
  fontSize?: string;
  level?: string;
  light?: boolean;
  muted?: boolean;
  noWrap?: boolean;
  textTransform?: string;
  truncate?: boolean;
}

const H1 = styled(Text.withComponent('h1'))<HeadingProps & React.HTMLAttributes<HTMLHeadingElement>>`
  font-size: 48px;
  font-weight: 300;
  line-height: 56px;
  margin-bottom: 64px;
  margin-top: 0;
  min-height: 48px;
  ${media.mobile`
    font-size: 40px;
    line-height: 48px;
  `};
`;

const H2 = styled(Text.withComponent('h2'))<HeadingProps & React.HTMLAttributes<HTMLHeadingElement>>`
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  margin-bottom: 24px;
  margin-top: 48px;

  ${media.mobile`
    font-size: 20px;
    line-height: 28px;
    margin-bottom: 20px;
    margin-top: 44px;
  `};
`;

const H3 = styled(Text.withComponent('h3'))<HeadingProps & React.HTMLAttributes<HTMLHeadingElement>>`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const H4 = styled(Text.withComponent('h4'))<HeadingProps & React.HTMLAttributes<HTMLHeadingElement>>`
  font-size: 11px;
  font-weight: 300;
  margin-bottom: 5px;
  margin-top: 20px;
`;

const Heading: React.SFC<HeadingProps & React.HTMLAttributes<HTMLHeadingElement>> = ({level, ...props}) => {
  switch (level) {
    case '2':
      return <H2 {...props} />;
    case '3':
      return <H3 {...props} />;
    case '4':
      return <H4 {...props} />;
    case '1':
    default:
      return <H1 {...props} />;
  }
};

H1.defaultProps = H2.defaultProps = H3.defaultProps = H4.defaultProps = Heading.defaultProps;

Heading.defaultProps = {
  block: true,
  bold: false,
  center: false,
  color: COLOR.TEXT,
  fontSize: '16px',
  level: '1',
  light: false,
  muted: false,
  noWrap: false,
  textTransform: 'none',
  truncate: false,
};

export {Heading, H1, H2, H3, H4};
