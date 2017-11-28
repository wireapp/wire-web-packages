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

import styled, {css} from 'styled-components';
import {COLOR} from '../Identity';
import PropTypes from 'prop-types';

const placeholderStyle = css`
  color: ${COLOR.GRAY_DARKEN_24};
  font-size: 11px;
  text-transform: ${props => props.placeholderTextTransform};
`;

const dotSize = 8;
const invalidDot = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${dotSize}" height="${dotSize}" viewBox="0 0 8 8">
    <circle cx="4" cy="4" r="4" fill="${COLOR.RED}" />
  </svg>
`;
const base64Dot = btoa(invalidDot);

const Input = styled.input`
  /* appearance */
  background: ${COLOR.WHITE};
  border-radius: 4px;
  border: none;
  color: ${COLOR.GRAY_DARKEN_72};
  font-weight: 400;
  outline: none;
  caret-color: ${COLOR.BLUE};

  /* positioning */
  line-height: 56px;
  margin: 0 0 16px;
  padding: 0 20px;
  width: 100%;

  &::-webkit-input-placeholder {
    /* WebKit, Blink, Edge */
    ${placeholderStyle};
  }
  &::-ms-input-placeholder {
    /* Microsoft Edge */
    ${placeholderStyle};
  }
  &::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    ${placeholderStyle};
    opacity: 1;
  }
  &:invalid {
    box-shadow: none;
  }
  ${props =>
    props.markInvalid &&
    `background: ${COLOR.WHITE} url('data:image/svg+xml;base64,${base64Dot}') no-repeat right 20px center`};
`;

Input.propTypes = {
  markInvalid: PropTypes.bool,
  placeholderTextTransform: PropTypes.string,
};

Input.defaultProps = {
  markInvalid: false,
  placeholderTextTransform: 'uppercase',
};

export {Input};
