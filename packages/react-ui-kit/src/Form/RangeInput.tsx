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
import React, {FC, forwardRef, Fragment} from 'react';
import {TextProps} from '../Text';
import {COLOR_V2} from '../Identity';
import {manySelectors} from '../util';
import {Theme} from '../Layout';
import InputLabel from './InputLabel';

const rangeInputWrapperStyles: CSSObject = {
  position: 'relative',
  marginTop: '19px',
};

const thumbSelectors = ['&::-webkit-slider-thumb', '&::-moz-range-thumb', '&::-ms-thumb'];
const sliderSelectors = ['&::-webkit-slider-runnable-track', '&::-moz-range-track', '&::-ms-track'];

const getImageCropZoomInputStyles = (theme: Theme, backgroundSize: `${number}% ${number}%`): CSSObject => ({
  display: 'block',
  '-webkit-appearance': 'none',
  width: '100%',
  height: '8px',
  background: COLOR_V2.GRAY_60,
  borderRadius: '4px',
  backgroundImage: `linear-gradient(${theme.general.primaryColor}, ${theme.general.primaryColor})`,
  backgroundSize: backgroundSize || '0% 100%',
  backgroundRepeat: 'no-repeat',

  ...manySelectors(thumbSelectors, {
    '-webkit-appearance': 'none',
    height: '18px',
    width: '18px',
    borderRadius: '50%',
    background: COLOR_V2.GRAY_80,
    cursor: 'pointer',
    border: 'none',
    boxShadow: 'none',
  }),

  ...manySelectors(sliderSelectors, {
    '-webkit-appearance': 'none',
    boxShadow: 'none',
    border: 'none',
    background: 'transparent',
  }),
});

enum ValueLabelPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

const getValueLabelStyles = (position: ValueLabelPosition): CSSObject => ({
  pointerEvents: 'none',
  bottom: '100%',
  fontSize: '16px',
  fontWeight: 300,
  position: 'absolute',
  [position]: '4px',
});

export interface RangeInputProps<T = HTMLInputElement> extends TextProps<T> {
  label?: string;
  minValueLabel?: string;
  maxValueLabel?: string;
}

export const RangeInput: FC<RangeInputProps> = forwardRef<HTMLInputElement, RangeInputProps<HTMLInputElement>>(
  ({
    ref,
    id = Math.random().toString(),
    label,
    minValueLabel,
    maxValueLabel,
    min = '0',
    max = '100',
    value = '0',
    onChange,
    ...inputProps
  }) => {
    const backgroundSize = `${((Number(value) - Number(min)) * 100) / (Number(max) - Number(min))}% 100%` as const;

    return (
      <Fragment>
        {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
        <div css={rangeInputWrapperStyles}>
          {minValueLabel && <span css={getValueLabelStyles(ValueLabelPosition.LEFT)}>{minValueLabel}</span>}
          {maxValueLabel && <span css={getValueLabelStyles(ValueLabelPosition.RIGHT)}>{maxValueLabel}</span>}
          <input
            ref={ref}
            css={(theme: Theme) => getImageCropZoomInputStyles(theme, backgroundSize)}
            id={id}
            name={id}
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            type="range"
            {...inputProps}
          />
        </div>
      </Fragment>
    );
  },
);
