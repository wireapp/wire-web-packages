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
import {jsx} from '@emotion/core';
import React from 'react';
import {COLOR} from '../Identity';
import {Text, TextProps, textStyle, textLinkStyle} from '../Text';
import {filterProps} from '../util';
import {INPUT_CLASSNAME, Input, InputProps} from './Input';

export interface StyledLabelProps<T = HTMLLabelElement> extends React.HTMLProps<T> {
  disabled?: boolean;
  markInvalid?: boolean;
}

const filterStyledLabelProps = (props: StyledLabelProps) => filterProps(props, ['markInvalid']);

const StyledLabel = (props: StyledLabelProps) => {
  const checkSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6"><path fill="white" d="M2.8 6L8 .7 7.3 0 2.8 4.6.7 2.4l-.7.7z"/></svg>';
  return (
    <label
      css={theme => ({
        [`.${INPUT_CLASSNAME}:checked + &::before`]: {
          background: `${COLOR.BLUE} url('data:image/svg+xml; utf8, ${checkSvg}') no-repeat center`,
        },
        [`.${INPUT_CLASSNAME}:focus + &::before`]: {
          borderColor: COLOR.BLUE,
        },
        '&::before': {
          background: COLOR.WHITE,
          border: props.markInvalid ? `1px solid ${COLOR.RED}` : `1px solid ${COLOR.GRAY}`,
          borderRadius: '4px',
          boxSizing: 'border-box',
          content: '""',
          display: 'inline-block',
          height: '16px',
          margin: '4px 8px 0 -16px',
          opacity: props.disabled ? 0.56 : 1,
          width: '16px',
        },
        a: {
          ...textLinkStyle(theme, {}),
        },
        display: 'flex',
        opacity: props.disabled ? 0.56 : 1,
      })}
      {...filterStyledLabelProps(props)}
    />
  );
};

interface CheckboxProps<T = HTMLInputElement> extends InputProps<T> {
  id?: string;
}

const filterCheckboxProps = (props: CheckboxProps) => filterProps(props, ['markInvalid']);

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
    <Input
      type={'checkbox'}
      id={id}
      style={{
        height: '16px',
        marginBottom: '0',
        opacity: 0,
        width: '16px',
      }}
      disabled={disabled}
      ref={ref}
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
    css={theme => ({
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
