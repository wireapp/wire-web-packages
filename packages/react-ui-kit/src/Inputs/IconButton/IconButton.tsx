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

import {forwardRef} from 'react';

import {CSSObject} from '@emotion/react';

import {defaultTransition} from '../../Identity/motions/motions';
import {Theme} from '../../Identity/Theme';
import {TextProps, filterTextProps} from '../../Typography';
import {filterProps} from '../../utils/util';

export enum IconButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export interface IconButtonProps<T = HTMLButtonElement> extends TextProps<T> {
  variant?: IconButtonVariant;
  group?: boolean;
  backgroundColor?: string;
}

export const iconButtonStyle: <T>(theme: Theme, props: IconButtonProps<T>) => CSSObject = (
  theme,
  {variant = IconButtonVariant.PRIMARY, group = false, backgroundColor, disabled = false},
) => ({
  border: 0,
  borderRadius: '12px',
  cursor: disabled ? 'default' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  padding: 0,
  outline: 'none',
  textDecoration: 'none',
  touchAction: 'manipulation',
  transition: defaultTransition,
  width: '40px',
  height: '32px',

  '&:hover, &:focus': {
    textDecoration: 'none',
  },
  ...(variant === IconButtonVariant.PRIMARY && {
    backgroundColor: disabled
      ? theme.IconButton.primaryDisabledBgColor
      : backgroundColor || theme.IconButton.primaryBgColor,
    border: disabled
      ? `1px solid ${theme.IconButton.primaryDisabledBorderColor}`
      : `1px solid ${theme.IconButton.primaryBorderColor}`,
    svg: {
      fill: disabled ? theme.Input.placeholderColor : theme.general.color,
    },
    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: theme.IconButton.hoverPrimaryBgColor,
      },
      '&:hover': {
        borderColor: theme.IconButton.primaryHoverBorderColor,
      },
      '&:focus': {
        borderColor: theme.IconButton.focusBorderColor,
        svg: {
          fill: theme.IconButton.focusBorderColor,
        },
      },
      '&:active': {
        backgroundColor: theme.IconButton.activePrimaryBgColor,
        borderColor: theme.IconButton.focusBorderColor,
        svg: {
          fill: theme.general.primaryColor,
        },
      },
    }),
  }),
  ...(variant === IconButtonVariant.SECONDARY && {
    backgroundColor: 'inherit',
    svg: {
      fill: disabled ? theme.Input.placeholderColor : theme.general.color,
    },
    ...(!disabled && {
      '&:hover, &:focus, &:active': {
        svg: {
          fill: theme.general.primaryColor,
        },
      },
      '&:focus': {
        border: `1px solid ${theme.IconButton.focusBorderColor}`,
      },
      '&:active': {
        border: `1px solid ${theme.IconButton.secondaryActiveBorderColor}`,
        backgroundColor: theme.Input.backgroundColor,
      },
    }),
  }),
  ...(group && {
    borderRadius: '0',

    '&:first-of-type': {
      borderRadius: '12px 0 0 12px',
    },
    '&:last-of-type': {
      borderRadius: '0 12px 12px 0',
    },
  }),
});

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({children, ...props}, ref) => (
  <button ref={ref} css={(theme: Theme) => iconButtonStyle(theme, props)} {...filterButtonProps(props)}>
    {children}
  </button>
));

IconButton.displayName = 'IconButton';

const filterButtonProps = (props: IconButtonProps) => {
  return filterProps(filterTextProps(props) as IconButtonProps, ['backgroundColor']);
};
