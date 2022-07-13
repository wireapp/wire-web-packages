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
import React, {FormEvent, MouseEvent, ReactElement, useRef, useState} from 'react';

import {selectStyle, dropdownStyles, dropdownOptionStyles} from './Select.styles';
import {Checkbox} from './Checkbox';
import InputLabel from './InputLabel';
import type {Theme} from '../Layout';
import {filterProps} from '../util';
import {ArrowDown} from '../Icon/ArrowDown';
import useOutsideClick from '../Misc/useOutsideClick';

export type SelectOption = {
  value: string | number;
  label: string;
  description?: string;
  isDisabled?: boolean;
};

export interface CommonSelectProps<T extends SelectOption = SelectOption, K extends SelectOption = SelectOption> {
  id: string;
  dataUieName: string;
  options: T[];
  onOptionChange: (idx: number) => void;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  markInvalid?: boolean;
  error?: ReactElement;
  wrapperCSS?: CSSObject;
  isMultiSelect?: boolean;
  selectedLabel?: string;
  selectedValue?: string;
  checkIsSelected?: (optionValue: string | number) => boolean;
}

const filterSelectProps = props => filterProps(props, ['markInvalid']);

const placeholderText = '- Please select -';

export const SelectContainer = <T extends SelectOption = SelectOption>({
  id,
  label,
  error,
  helperText,
  options = [],
  onOptionChange,
  required,
  markInvalid,
  dataUieName,
  wrapperCSS = {},
  isMultiSelect = false,
  selectedLabel,
  selectedValue,
  checkIsSelected = () => false,
  ...rest
}: CommonSelectProps<T>) => {
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOptionIdx, setHoveredOptionIdx] = useState(null);

  const onOutsideClick = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  useOutsideClick([selectContainerRef], onOutsideClick);

  const hasError = !!error;

  const onToggleDropdown = () => setIsDropdownOpen(prevState => !prevState);

  const scrollToCurrentOption = (idx: number) => {
    if (listRef.current) {
      const listSelectedOption = listRef.current.children[idx] as HTMLLIElement;
      const getYPosition = listSelectedOption && listSelectedOption.offsetTop;

      listRef.current.scroll({
        top: getYPosition ?? 0,
        behavior: 'smooth',
      });
    }
  };

  const onOptionSelect = (idx: number | null) => {
    setHoveredOptionIdx(idx);

    if (idx !== null) {
      scrollToCurrentOption(idx);
    }
  };

  const onChange =
    (idx: number, onCheckboxClick = false) =>
    (event?: MouseEvent<HTMLElement> | FormEvent<HTMLElement>) => {
      if (onCheckboxClick) {
        event?.stopPropagation();
      }

      scrollToCurrentOption(idx);
      onOptionChange(idx);

      if (!onCheckboxClick) {
        setIsDropdownOpen(false);
      }
    };

  const handleListKeyDown = e => {
    switch (e.key) {
      case ' ':
      case 'SpaceBar':
      case 'Enter':
        e.preventDefault();

        onChange(hoveredOptionIdx)();
        break;

      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
        }

        e.preventDefault();
        onOptionSelect(hoveredOptionIdx - 1 >= 0 ? hoveredOptionIdx - 1 : options.length - 1);
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
        }

        e.preventDefault();
        if (hoveredOptionIdx === null) {
          onOptionSelect(0);
        } else {
          onOptionSelect(hoveredOptionIdx === options.length - 1 ? 0 : hoveredOptionIdx + 1);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div
      css={(theme: Theme) => ({
        marginBottom: markInvalid ? '2px' : '20px',
        width: '100%',
        '&:focus-within label': {
          color: theme.general.primaryColor,
        },
        ...wrapperCSS,
      })}
      data-uie-name={dataUieName}
      ref={selectContainerRef}
    >
      {label && (
        <InputLabel htmlFor={id} isRequired={required} markInvalid={markInvalid}>
          {label}
        </InputLabel>
      )}

      <div css={{position: 'relative', width: '100%'}}>
        <button
          type="button"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          aria-labelledby={id}
          id={id}
          onClick={onToggleDropdown}
          onKeyDown={handleListKeyDown}
          css={(theme: Theme) => selectStyle(theme, rest, hasError)}
          data-uie-name={dataUieName}
          {...(selectedLabel && {
            'aria-activedescendant': selectedLabel,
          })}
          {...(selectedValue && {
            'data-value': selectedValue,
          })}
          {...filterSelectProps(rest)}
        >
          <span css={{display: 'block', padding: '8px 16px'}}>{selectedLabel ?? placeholderText}</span>

          <ArrowDown />
        </button>

        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          css={(theme: Theme) => dropdownStyles(theme, isDropdownOpen)}
          {...(dataUieName && {
            'data-uie-name': `dropdown-${dataUieName}`,
          })}
        >
          {options.map((option, index) => {
            const isSelected = checkIsSelected(option.value);
            const isHoveredOption = hoveredOptionIdx === index;

            return (
              <li
                key={option.value}
                id={option.value.toString()}
                role="option"
                aria-selected={isHoveredOption || isSelected}
                tabIndex={-1}
                onClick={event => {
                  if (!option.isDisabled) {
                    onChange(index)(event);
                  }
                }}
                css={(theme: Theme) =>
                  dropdownOptionStyles(theme, isSelected || isHoveredOption, option.isDisabled, isMultiSelect)
                }
                {...(dataUieName && {
                  'data-uie-name': `option-${dataUieName}`,
                  'data-uie-value': option.value,
                })}
              >
                {isMultiSelect && (
                  <Checkbox
                    id={`${option.value.toString()}-checkbox`}
                    checked={isSelected}
                    onChange={onChange(index, true)}
                    wrapperCSS={{gridArea: 'checkbox'}}
                    checkboxClassName={isHoveredOption && 'hover'}
                    disabled={option.isDisabled}
                  />
                )}

                <span css={{gridArea: 'label'}}>{option.label}</span>

                {option.description && (
                  <p
                    css={(theme: Theme) => ({
                      marginBottom: 0,
                      fontSize: '14px',
                      color: isSelected ? theme.general.color : theme.Input.labelColor,
                      gridArea: 'description',
                    })}
                  >
                    {option.description}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {!hasError && helperText && (
        <p css={(theme: Theme) => ({fontSize: '12px', fontWeight: 400, color: theme.Input.labelColor, marginTop: 8})}>
          {helperText}
        </p>
      )}

      {error}
    </div>
  );
};
