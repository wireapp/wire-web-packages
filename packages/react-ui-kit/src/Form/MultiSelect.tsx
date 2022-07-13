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
import {jsx} from '@emotion/react';

import {CommonSelectProps, SelectOption} from './SelectContainer';
import {SelectContainer} from './SelectContainer';

interface MultiSelectProps<T extends SelectOption = SelectOption, K extends SelectOption = SelectOption>
  extends CommonSelectProps<T> {
  onChange: (selectedOption: T[]) => void;
  value?: T[] | null;
}

export const MultiSelect = <T extends SelectOption = SelectOption>({
  options = [],
  value = null,
  onChange,
  ...rest
}: MultiSelectProps) => {
  const onOptionChange = (idx: number) => {
    if (value.some(val => val.value === options[idx].value)) {
      const filteredValues = value.filter(val => val.value !== options[idx].value);

      onChange(filteredValues);
    } else {
      const optionsBefore = [...value.slice(0, idx)];
      const optionsAfter = [...value.slice(idx)];

      onChange([...optionsBefore, options[idx], ...optionsAfter]);
    }
  };

  const mapCurrentValue = (currentValues = [], attr = 'label') =>
    currentValues.length > 0 ? currentValues.map(option => option[attr]).join(', ') : null;

  const selectedLabel = mapCurrentValue(value);
  const selectedValue = mapCurrentValue(value, 'value');

  const checkIsSelected = optionValue => value.some(val => val.value === optionValue);

  return (
    <SelectContainer
      {...rest}
      options={options}
      isMultiSelect
      onOptionChange={onOptionChange}
      selectedLabel={selectedLabel}
      selectedValue={selectedValue}
      checkIsSelected={checkIsSelected}
    />
  );
};
