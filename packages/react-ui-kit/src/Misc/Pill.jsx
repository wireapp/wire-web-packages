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

import styled, {keyframes} from 'styled-components';
import {COLOR} from '../Identity';
import PropTypes from 'prop-types';
import React from 'react';

const PILL_TYPE = {
  error: 'ERROR',
  success: 'SUCCESS',
  warning: 'WARNING',
};

const backgroundColors = {
  [PILL_TYPE.error]: COLOR.RED_OPAQUE_16,
  [PILL_TYPE.success]: COLOR.GREEN_OPAQUE_16,
  [PILL_TYPE.warning]: COLOR.YELLOW_OPAQUE_16,
};

const pillAnimation = keyframes`
@keyframes pill-activate {
    0% {
      background-color: transparent;
    }
    100% {
      background-color: #eee;
    }
`;

const StyledPill = styled.span`
  ${({type}) => {
    const backgroundColor = type ? backgroundColors[type] : 'transparent';
    const margin = type ? '12px 0 0 0' : '0 8px';
    return `
        background-color: ${backgroundColor};
        margin: ${margin};
    `;
  }};
  font-size: 12px;
  text-decoration: none;
  padding: 8px 24px;
  border-radius: 160px;
  min-height: 32px;
  line-height: 16px;
  text-align: center;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  ${({active}) =>
    active &&
    `
        cursor: default;
        background-color: #eee;
        animation: ${pillAnimation} 300ms ease-out;`};
`;

const Pill = ({active, children, type, ...props}) => (
  <StyledPill active={active} type={type} data-uie-name="element-pill" data-uie-status={type} {...props}>
    {children}
  </StyledPill>
);

Pill.propTypes = {
  active: PropTypes.boolean,
  children: PropTypes.node,
  type: PropTypes.oneOf(Object.keys(PILL_TYPE)),
};

Pill.defaultProps = {
  active: true,
  type: null,
};

export {Pill, PILL_TYPE};
