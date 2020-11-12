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
import {InputProps} from '../../dist';
import {COLOR} from '../Identity';
import {Loading} from '../Misc';

export interface SwitchProps<T = HTMLInputElement> extends InputProps<T> {
  activatedColor?: string;
  deactivatedColor?: string;
  disabledColor?: string;
  showLoading?: boolean;
  loadingColor?: string;
  onToggle: (isChecked: boolean) => void;
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
  disabledColor = COLOR.DISABLED,
  name,
}: SwitchProps) => (
  <div
    css={{
      position: 'relative',
      width: '42px',
      display: 'inline-block',
      verticalAlign: 'middle',
      userSelect: 'none',
      textAlign: 'left',
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
          display: 'block',
          overflow: 'hidden',
          cursor: disabled || showLoading ? '' : 'pointer',
          borderRadius: '20px',
          margin: 0,
        }}
      >
        <span
          css={{
            display: 'block',
            width: '200%',
            marginLeft: checked ? 0 : '-100%',
            transition: 'margin 0.1s ease-in 0s',
            '&:before, &:after': {
              backgroundColor: disabled || showLoading ? disabledColor : checked ? activatedColor : deactivatedColor,
              display: 'block',
              float: 'left',
              width: '50%',
              height: '25px',
              padding: 0,
              lineHeight: '25px',
            },
            '&:before': {
              content: '" "',
              paddingLeft: '10px',
            },
            '&:after': {
              content: '" "',
              paddingRight: '10px',
              textAlign: 'right',
            },
          }}
        />
        {showLoading ? (
          <Loading
            size={21}
            color={loadingColor}
            style={{
              display: 'block',
              position: 'absolute',
              margin: '2px',
            }}
          />
        ) : (
          <span
            style={{
              display: 'block',
              boxShadow: '0px 0px 2px -1px gray',
              width: '23px',
              height: '23px',
              margin: '1px',
              background: COLOR.WHITE,
              opacity: disabled ? 0.5 : undefined,
              position: 'absolute',
              top: 0,
              bottom: 0,
              borderRadius: '100%',
              transition: 'all 0.15s ease-in 0s',
              right: checked ? '0px' : '17px',
            }}
          />
        )}
      </label>
    </React.Fragment>
  </div>
);
