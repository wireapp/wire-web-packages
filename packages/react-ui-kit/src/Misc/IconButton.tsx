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

/** @jsx jsx */
import {CSSObject, jsx} from '@emotion/react';

import {COLOR_V2} from '../Identity';
import {defaultTransition} from '../Identity/motions';
import type {Theme} from '../Layout';
import {TextProps, filterTextProps} from '../Text';
import {filterProps} from '../util';

export enum IconButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export interface IconButtonProps<T = HTMLButtonElement> extends TextProps<T> {
  variant?: IconButtonVariant;
  backgroundColor?: string;
}

export const iconButtonStyle: <T>(theme: Theme, props: IconButtonProps<T>) => CSSObject = (
  theme,
  {variant = IconButtonVariant.PRIMARY, backgroundColor, disabled = false},
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
      ? theme.IconButton.hoverPrimaryBgColor
      : backgroundColor || theme.IconButton.primaryBgColor,
    border: `1px solid ${theme.Input.labelColor}`,
    svg: {
      fill: disabled ? theme.Input.backgroundColorDisabled : theme.general.color,
    },
    ...(!disabled && {
      '&:hover, &:focus': {
        backgroundColor: theme.IconButton.hoverPrimaryBgColor,
      },
      '&:hover': {
        borderColor: theme.Select.borderColor,
      },
      '&:focus': {
        borderColor: theme.IconButton.activePrimaryBorderColor,
      },
      '&:active': {
        backgroundColor: theme.IconButton.activePrimaryBgColor,
        borderColor: theme.IconButton.activePrimaryBorderColor,
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
        border: `1px solid ${COLOR_V2.BLUE_LIGHT_300}`,
      },
      '&:active': {
        backgroundColor: theme.general.backgroundColor,
      },
    }),
  }),
});

export const IconButton = ({children, ...props}: IconButtonProps) => (
  <button css={(theme: Theme) => iconButtonStyle(theme, props)} {...filterButtonProps(props)}>
    {children}
  </button>
);

const filterButtonProps = (props: IconButtonProps) => {
  return filterProps(filterTextProps(props) as IconButtonProps, ['backgroundColor']);
};
