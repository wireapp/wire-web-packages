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
import {jsx} from '@emotion/react';
import React from 'react';

import {COLOR} from '../Identity';
import {Theme} from '../Layout';
import {Text, TextProps, textStyle, textLinkStyle} from '../Text';
import {filterProps} from '../util';
import {INPUT_CLASSNAME, InputProps} from './Input';

export interface StyledLabelProps<T = HTMLLabelElement> extends React.HTMLProps<T> {
  disabled?: boolean;
  markInvalid?: boolean;
}

const filterStyledLabelProps = (props: StyledLabelProps) => filterProps(props, ['markInvalid']);

const checkSvg = (theme: Theme) =>
  `<svg width="15" height="13" viewBox="0 0 16 13" xmlns="http://www.w3.org/2000/svg"><path d="M5.65685 12.0711L15.9842 1.62738L14.57 0.213167L5.65685 9.24264L1.41421 5L0 6.41421L5.65685 12.0711Z" fill="${
    theme.darkMode ? 'black' : 'white'
  }"/></svg>`;

const StyledLabel = (props: StyledLabelProps) => {
  const {disabled, markInvalid} = props;

  return (
    <label
      css={(theme: Theme) => ({
        [`.${INPUT_CLASSNAME}:checked + &::before`]: {
          background: `${
            disabled ? theme.checkbox.disablecheckedBgColor : theme.general.primaryColor
          } url('data:image/svg+xml; utf8, ${checkSvg(theme)}') no-repeat center`,
          borderColor: theme.general.primaryColor,
        },
        ...(!disabled && {
          [`.${INPUT_CLASSNAME}:focus + &::before`]: {
            border: `1.5px solid ${theme.checkbox.borderFocused}`,
          },
          [`.${INPUT_CLASSNAME}:hover + &::before`]: {
            borderColor: theme.general.primaryColor,
          },
        }),
        [`.${INPUT_CLASSNAME} + &::before`]: {
          background: disabled ? theme.checkbox.disableBgColor : theme.checkbox.background,
          ...(!disabled
            ? {
                border: markInvalid
                  ? `1.5px solid ${theme.checkbox.invalidBorderColor}`
                  : `1.5px solid ${theme.checkbox.border}`,
              }
            : {
                border: `1.5px solid ${theme.checkbox.disableBorderColor}`,
              }),
          borderRadius: '3px',
          boxSizing: 'border-box',
          content: '""',
          display: 'inline-block',
          height: '22px',
          lineHeight: 1.5,
          margin: '0 8px 0 -16px',
          width: '22px',
          color: theme.general.color,
        },
        a: {
          ...textLinkStyle(theme, {}),
        },
        lineHeight: 1.5,
        display: 'flex',
        opacity: disabled ? 0.56 : 1,
      })}
      {...filterStyledLabelProps(props)}
    />
  );
};

interface CheckboxProps<T = HTMLInputElement> extends InputProps<T> {
  id?: string;
}

const filterCheckboxProps = (props: CheckboxProps) => filterProps(props, ['markInvalid']);

// We use Math.random..., because some of apps doesn't migrated to newest version of React.
export const Checkbox: React.FC<CheckboxProps<HTMLInputElement>> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps<HTMLInputElement>
>(({id = Math.random().toString(), children, style, disabled, ...props}, ref) => (
  <div
    css={{
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'flex-start',
    }}
    style={style}
  >
    <input
      type="checkbox"
      id={id}
      style={{
        height: '22px',
        marginBottom: '0',
        opacity: 0,
        width: '22px',
      }}
      disabled={disabled}
      ref={ref}
      className={INPUT_CLASSNAME}
      {...filterCheckboxProps(props)}
    />

    <StyledLabel htmlFor={id} disabled={disabled} markInvalid={props.markInvalid}>
      {children}
    </StyledLabel>
  </div>
));

export type CheckboxLabelProps<T = HTMLSpanElement> = TextProps<T>;

export const CheckboxLabel = ({color = COLOR.TEXT, ...props}: CheckboxLabelProps) => (
  <Text
    css={(theme: Theme) => ({
      ...textStyle(theme, {
        color,
        ...props,
      }),
      a: {
        color: COLOR.LINK,
        textDecoration: 'none',
      },
    })}
    {...props}
  />
);
