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

import {COLOR} from '../Identity';
import PropTypes from 'prop-types';
import React from 'react';
import {Text} from './Text';

const H1 = Text.withComponent('h1').extend`
  /* appearance */
  color: ${props => (props.color ? props.color : COLOR.GRAY_LIGHTEN_24)};
  font-size: 48px;
  font-weight: 300;

  /* positioning */
  line-height: 62px;
  margin-bottom: 40px;
  margin-top: 32px;
  min-height: 62px;
`;

const H2 = Text.withComponent('h2').extend`
  /* appearance */
  color: ${props => (props.color ? props.color : COLOR.GRAY_DARKEN_72)};
  font-size: 24px;
  font-weight: 300;
`;

const H3 = Text.withComponent('h3').extend`
  /* appearance */
  color: ${props => (props.color ? props.color : COLOR.GRAY_DARKEN_72)};
  font-size: 18px;
  font-weight: 600;
`;

const H4 = Text.withComponent('h4').extend`
  /* appearance */
  color: ${props => (props.color ? props.color : COLOR.GRAY_DARKEN_72)};
  font-size: 11px;
  font-weight: 700;

  /* positioning */
  margin-bottom: 5px;
  margin-top: 20px;
`;

const Heading = ({level, ...props}) => {
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

Heading.propTypes = {
  ...Text.propTypes,
  color: PropTypes.string,
  level: PropTypes.oneOf(['1', '2', '3', '4']),
};

Heading.defaultProps = {
  ...Text.defaultProps,
  color: '',
  level: '1',
};

export {Heading, H1, H2, H3, H4};
