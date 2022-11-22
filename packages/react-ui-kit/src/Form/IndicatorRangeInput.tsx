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

import {FC, forwardRef, useMemo} from 'react';

import {CSSObject} from '@emotion/react';

import {containerStyles, dataListOption, headingStyle, rangeStyles} from './IndicatorRangeInput.styles';
import {InputLabel} from './InputLabel';

import {TextProps} from '../Text';

type DataListOptions = {
  value: number;
  label: string;
  heading?: string;
};

export interface IndicatorRangeInputProps<T = HTMLInputElement> extends TextProps<T> {
  label?: string;
  wrapperCSS?: CSSObject;
  dataListOptions?: DataListOptions[];
}

export const IndicatorRangeInput: FC<IndicatorRangeInputProps> = forwardRef<
  HTMLInputElement,
  IndicatorRangeInputProps<HTMLInputElement>
>(
  (
    {
      id = Math.random().toString(),
      label,
      min = '0',
      max = '100',
      value = '0',
      onChange,
      wrapperCSS,
      dataListOptions = [],
      ...inputProps
    },
    ref,
  ) => {
    const minNum = Number(min);

    const isCustomSlider = !!dataListOptions.length;

    const listLength = dataListOptions.length - 1;
    const valueNum = Number(value);

    const maxNum = isCustomSlider ? Number(listLength) : Number(max);

    const backgroundSize = useMemo(() => {
      if (isCustomSlider && valueNum === 0) {
        const firstOptionThumbPosition = `calc(((100% - 10px) / (${listLength} * 2) - 4px) / 2)`;

        return `${firstOptionThumbPosition} 100%`;
      }

      return `${((valueNum - minNum) * 100) / (maxNum - minNum)}% 100%`;
    }, [valueNum, minNum, maxNum, listLength]);

    return (
      <div css={wrapperCSS}>
        {label && <InputLabel htmlFor={id}>{label}</InputLabel>}

        <div css={containerStyles}>
          {isCustomSlider && (
            <div css={{position: 'relative', display: 'flex', marginBottom: '20px'}}>
              {dataListOptions.map(dataListOption => (
                <div key={dataListOption.value} css={() => headingStyle(listLength)}>
                  {dataListOption?.heading}
                </div>
              ))}
            </div>
          )}

          <input
            ref={ref}
            css={() => rangeStyles(backgroundSize, valueNum, listLength, isCustomSlider)}
            id={id}
            name={id}
            min={minNum}
            max={maxNum}
            value={value}
            onChange={onChange}
            type="range"
            list="tickMarks"
            {...inputProps}
          />

          {isCustomSlider && (
            <datalist id="tickMarks" css={() => dataListOption(listLength)}>
              {dataListOptions.map((dataListOption, index) => (
                <option key={index} value={dataListOption.value} label={dataListOption.label} />
              ))}
            </datalist>
          )}
        </div>
      </div>
    );
  },
);
IndicatorRangeInput.displayName = 'IndicatorRangeInput';
