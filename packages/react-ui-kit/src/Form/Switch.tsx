/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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
import {Loading} from '../Misc';
import {InputProps} from './Input';

export interface SwitchProps<T = HTMLInputElement> extends InputProps<T> {
  activatedColor?: string;
  checked: boolean;
  deactivatedColor?: string;
  disabled?: boolean;
  disabledColor?: string;
  id?: string;
  loadingColor?: string;
  name?: string;
  onToggle: (isChecked: boolean) => void;
  showLoading?: boolean;
}

export const Switch = ({
  id = Math.random().toString(),
  checked,
  onToggle = () => {},
  showLoading,
  disabled,
  loadingColor = COLOR.BLUE,
  activatedColor = COLOR.BLUE,
  deactivatedColor = '#d2d2d2',
  name,
}: SwitchProps) => (
  <div
    style={{
      display: 'inline-block',
      position: 'relative',
      textAlign: 'left',
      userSelect: 'none',
      verticalAlign: 'middle',
      width: '42px',
    }}
  >
    <React.Fragment>
      <input
        id={id}
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={event => onToggle(event.target.checked)}
        type="checkbox"
        style={{display: 'none'}}
      />
      <label
        htmlFor={id}
        style={{
          borderRadius: '20px',
          cursor: disabled || showLoading ? '' : 'pointer',
          display: 'block',
          margin: 0,
          overflow: 'hidden',
        }}
      >
        <span
          css={{
            ['&:after']: {
              content: '" "',
              paddingRight: '10px',
              textAlign: 'right',
            },
            ['&:before']: {
              content: '" "',
              paddingLeft: '10px',
            },
            ['&:before, &:after']: {
              backgroundColor:
                disabled || showLoading
                  ? COLOR.tint(checked ? activatedColor : deactivatedColor, 0.4)
                  : checked
                  ? activatedColor
                  : deactivatedColor,
              boxSizing: 'border-box',
              display: 'block',
              float: 'left',
              height: '25px',
              lineHeight: '25px',
              padding: 0,
              width: '50%',
            },
            display: 'block',
            marginLeft: checked ? 0 : '-100%',
            transition: 'margin 0.1s ease-in 0s',
            width: '200%',
          }}
        />
        {showLoading ? (
          <Loading
            size={21}
            color={loadingColor}
            style={{
              display: 'block',
              margin: '2px',
              position: 'absolute',
            }}
          />
        ) : (
          <span
            style={{
              background: COLOR.WHITE,
              borderRadius: '100%',
              bottom: 0,
              boxShadow: '0px 0px 2px -1px gray',
              display: 'block',
              height: '23px',
              margin: '1px',
              opacity: disabled ? 0.7 : undefined,
              position: 'absolute',
              right: checked ? '0px' : '17px',
              top: 0,
              transition: 'all 0.15s ease-in 0s',
              width: '23px',
            }}
          />
        )}
      </label>
    </React.Fragment>
  </div>
);
