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
import styled from '@emotion/styled';
import {COLOR} from '../Identity';
import {Input} from './Input';

export interface InternalSelectProps {
  disabled?: boolean;
}

export interface SelectProps extends InternalSelectProps, React.HTMLAttributes<HTMLSelectElement> {}

const ArrowDown = `
  <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
    <path fill="${COLOR.TEXT}" fillRule="evenodd" d="M0 2h8L4 7" />
  </svg>
`;

const selectStyle: (props: InternalSelectProps) => ObjectInterpolation<undefined> = ({disabled}) => ({
  '&:-moz-focusring': {
    color: 'transparent',
    textShadow: '0 0 0 #000',
  },
  '&:disabled': {
    color: COLOR.GRAY,
  },
  MozAppearance: 'none',
  WebkitAppearance: 'none',
  background: disabled ? `center right 16px no-repeat url('data:image/svg+xml;utf8,${ArrowDown}')` : 'unset',
  cursor: disabled ? 'normal' : 'pointer',
  fontWeight: 300,
  paddingRight: '30px',
});

const Select = (props: SelectProps) => <select css={selectStyle(props)} {...props} />;

export {Select, selectStyle};
