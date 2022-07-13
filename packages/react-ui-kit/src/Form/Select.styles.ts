/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {Theme} from '../Layout';
import {CSSObject} from '@emotion/react';
import {inputStyle} from './Input';

export const selectStyle: <T>(theme: Theme, props, error?: boolean) => CSSObject = (
  theme,
  {disabled = false, markInvalid, ...props},
  error = false,
) => ({
  ...inputStyle(theme, props),
  '&:-moz-focusring': {
    color: 'transparent',
    textShadow: '0 0 0 #000',
  },
  '&:disabled': {
    color: theme.Select.disabledColor,
  },
  appearance: 'none',
  boxShadow: markInvalid ? `0 0 0 1px ${theme.general.dangerColor}` : `0 0 0 1px ${theme.Select.borderColor}`,
  cursor: disabled ? 'normal' : 'pointer',
  fontSize: '16px',
  fontWeight: 300,
  height: 'auto',
  minHeight: '48px',
  padding: 0,
  paddingRight: '40px',
  textAlign: 'left',
  marginBottom: error && '8px',
  '&:invalid, option:first-of-type': {
    color: theme.general.dangerColor,
  },
  ...(!disabled && {
    '&:hover': {
      boxShadow: `0 0 0 1px ${theme.Select.borderColor}`,
    },
    '&:focus, &:active': {
      boxShadow: `0 0 0 1px ${theme.general.primaryColor}`,
    },
  }),
  '& > svg': {
    fill: disabled ? theme.Input.placeholderColor : theme.general.color,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '1rem',
  },
});

export const dropdownStyles = (theme: Theme, isDropdownOpen: boolean): CSSObject => ({
  height: isDropdownOpen ? 'auto' : 0,
  visibility: isDropdownOpen ? 'visible' : 'hidden',
  margin: '3px 0 0',
  padding: 0,
  borderRadius: '10px',
  border: `1px solid ${theme.general.primaryColor}`,
  position: 'absolute',
  top: '100%',
  left: 0,
  width: '100%',
  maxHeight: '240px',
  overflowY: 'auto',
  zIndex: 9,
});

export const dropdownOptionStyles = (
  theme: Theme,
  isSelected = false,
  isDisabled = false,
  isMultiSelect = false,
): CSSObject => ({
  background: isSelected ? theme.general.primaryColor : theme.general.backgroundColor,
  listStyle: 'none',
  padding: '10px 20px 14px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  fontSize: '16px',
  fontWeight: 300,
  lineHeight: '24px',
  letterSpacing: '0.05px',
  color: isSelected ? theme.Select.contrastTextColor : theme.general.color,
  ...(isMultiSelect
    ? {
        display: 'grid',
        gridTemplateAreas: `"checkbox label"
      ". description"`,
        gridTemplateColumns: '30px 1fr',
      }
    : {
        '&:hover, &:active, &:focus': {
          background: theme.general.primaryColor,
          borderColor: theme.general.primaryColor,
          color: theme.Select.contrastTextColor,
        },
      }),
  '&:first-of-type': {
    borderRadius: '12px 12px 0 0',
  },
  '&:last-of-type': {
    borderRadius: '0 0 12px 12px',
  },
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.Select.borderColor}`,
  },
  '&:not(:first-of-type)': {
    borderTop: `1px solid ${theme.Select.borderColor}`,
  },
});
