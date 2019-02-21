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
import {TextTransformProperty} from 'csstype';
import React from 'react';
import {COLOR} from '../Identity';
import {TextProps} from '../Text';
import {inlineSVG} from '../util';

export interface InputProps<T = HTMLInputElement> extends TextProps<T> {
  markInvalid?: boolean;
  placeholderTextTransform?: TextTransformProperty;
}

const inputStyle: (props: InputProps) => ObjectInterpolation<undefined> = props => {
  const invalidDot = `
    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="4" fill="${COLOR.RED}" />
    </svg>
  `;

  const placeholderStyle = {
    color: COLOR.GRAY_DARKEN_24,
    fontSize: '11px',
    textTransform: props.placeholderTextTransform,
  };

  return {
    '&::-moz-placeholder': {
      ...placeholderStyle,
      opacity: 1,
    },
    '&::-ms-input-placeholder': {
      ...placeholderStyle,
    },
    '&::-webkit-input-placeholder': {
      ...placeholderStyle,
    },
    '&:invalid': {
      boxShadow: 'none',
    },
    background: props.markInvalid
      ? `${COLOR.WHITE} url("${inlineSVG(invalidDot)}") no-repeat right 20px center`
      : COLOR.WHITE,
    border: 'none',
    borderRadius: '4px',
    caretColor: COLOR.BLUE,
    color: COLOR.TEXT,
    fontWeight: 300,
    height: '56px',
    lineHeight: '24px',
    margin: '0 0 16px',
    outline: 'none',
    padding: '0 16px',
    width: '100%',
  };
};

const INPUT_CLASSNAME = 'input';

const Input = React.forwardRef((props: InputProps, ref: React.Ref<HTMLInputElement>) => (
  <input className={INPUT_CLASSNAME} css={inputStyle(props)} ref={ref} type={props.type} {...props} />
));

Input.defaultProps = {
  markInvalid: false,
  placeholderTextTransform: 'uppercase',
};

export {INPUT_CLASSNAME, Input, inputStyle};
