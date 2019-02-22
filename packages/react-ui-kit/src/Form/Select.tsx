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
import {ObjectInterpolation, jsx} from '@emotion/core';
import {COLOR} from '../Identity';
import {inlineSVG} from '../util';
import {InputProps, inputStyle} from './Input';

export interface SelectProps<T = HTMLSelectElement> extends InputProps<T> {
  disabled?: boolean;
}

const ArrowDown = `
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
    <path fill="${COLOR.TEXT}" fillRule="evenodd" d="M0 2h8L4 7" />
  </svg>
`;

const selectStyle: (props: SelectProps) => ObjectInterpolation<undefined> = ({disabled = false, ...props}) => ({
  ...inputStyle(props as any),
  '&:-moz-focusring': {
    color: 'transparent',
    textShadow: '0 0 0 #000',
  },
  '&:disabled': {
    color: COLOR.GRAY,
  },
  appearance: 'none',
  background: disabled
    ? COLOR.shade(COLOR.WHITE, 0.06)
    : `${COLOR.WHITE} center right 16px no-repeat url("${inlineSVG(ArrowDown)}")`,
  cursor: disabled ? 'normal' : 'pointer',
  fontWeight: 300,
  paddingRight: '30px',
});

const Select = (props: SelectProps) => <select css={selectStyle(props)} {...props} />;

export {Select, selectStyle};
