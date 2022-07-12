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
import {CSSObject, jsx} from '@emotion/react';

import type {Theme} from '../Layout';
import {filterProps} from '../util';
import {inputStyle} from './Input';
import React, {ReactElement, useEffect, useRef, useState} from 'react';
import InputLabel from './InputLabel';
import {Checkbox} from './Checkbox';

export type SelectOption = {
  value: string | number;
  label: string;
  description?: string;
  isDisabled?: boolean;
};

interface CommonSelectProps<T extends SelectOption = SelectOption> {
  id: string;
  dataUieName: string;
  options: T[];
  isMultiSelect?: boolean;
  helperText?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  markInvalid?: boolean;
  error?: ReactElement;
  wrapperCSS?: CSSObject;
}

interface SingleSelectProps<T extends SelectOption = SelectOption> extends CommonSelectProps<T> {
  onChange: (selectedOption: T) => void;
  value?: T | null;
}

interface MultipleSelectProps<T extends SelectOption = SelectOption> extends CommonSelectProps<T> {
  onChange: (selectedOption: T[]) => void;
  value?: T[] | null;
}

const ArrowDown = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    <path d="M7.99963 12.5711L15.6565 4.91421L14.2423 3.5L7.99963 9.74264L1.75699 3.5L0.342773 4.91421L7.99963 12.5711Z" />
  </svg>
);

export const selectStyle: <T>(theme: Theme, props, error?: boolean) => CSSObject = (
  theme,
  {disabled = false, markInvalid, ...props},
  error = false,
) => ({
  ...inputStyle(theme, props),
  '&:-moz-focusring': {
    color: 'transparent',
    textShadow: '0 0 0 #000',
  },
  '&:disabled': {
    color: theme.Select.disabledColor,
  },
  appearance: 'none',
  boxShadow: markInvalid ? `0 0 0 1px ${theme.general.dangerColor}` : `0 0 0 1px ${theme.Select.borderColor}`,
  cursor: disabled ? 'normal' : 'pointer',
  fontSize: '16px',
  fontWeight: 300,
  height: 'auto',
  minHeight: '48px',
  padding: 0,
  paddingRight: '40px',
  textAlign: 'left',
  marginBottom: error && '8px',
  '&:invalid, option:first-of-type': {
    color: theme.general.dangerColor,
  },
  ...(!disabled && {
    '&:hover': {
      boxShadow: `0 0 0 1px ${theme.Select.borderColor}`,
    },
    '&:focus, &:active': {
      boxShadow: `0 0 0 1px ${theme.general.primaryColor}`,
    },
  }),
  '& > svg': {
    fill: disabled ? theme.Input.placeholderColor : theme.general.color,
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: '1rem',
  },
});

const dropdownStyles = (theme: Theme, isDropdownOpen: boolean): CSSObject => ({
  height: isDropdownOpen ? 'auto' : 0,
  visibility: isDropdownOpen ? 'visible' : 'hidden',
  margin: '3px 0 0',
  padding: 0,
  borderRadius: '10px',
  border: `1px solid ${theme.general.primaryColor}`,
  position: 'absolute',
  top: '100%',
  left: 0,
  width: '100%',
  maxHeight: '240px',
  overflowY: 'auto',
  zIndex: 9,
});

const dropdownOptionStyles = (
  theme: Theme,
  isSelected = false,
  isMultiSelect = false,
  isDisabled = false,
): CSSObject => ({
  background: isSelected ? theme.general.primaryColor : theme.general.backgroundColor,
  listStyle: 'none',
  padding: '10px 20px 14px',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  fontSize: '16px',
  fontWeight: 300,
  lineHeight: '24px',
  letterSpacing: '0.05px',
  color: isSelected ? theme.Select.contrastTextColor : theme.general.color,
  ...(isMultiSelect
    ? {
        display: 'grid',
        gridTemplateAreas: `"checkbox label"
      ". description"`,
        gridTemplateColumns: '30px 1fr',
      }
    : {
        '&:hover, &:active, &:focus': {
          background: theme.general.primaryColor,
          borderColor: theme.general.primaryColor,
          color: theme.Select.contrastTextColor,
        },
      }),
  '&:first-of-type': {
    borderRadius: '12px 12px 0 0',
  },
  '&:last-of-type': {
    borderRadius: '0 0 12px 12px',
  },
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${theme.Select.borderColor}`,
  },
  '&:not(:first-of-type)': {
    borderTop: `1px solid ${theme.Select.borderColor}`,
  },
});

const filterSelectProps = props => filterProps(props, ['markInvalid']);

const placeholderText = '- Please select -';

const isSingle = (props: SingleSelectProps | MultipleSelectProps): props is SingleSelectProps =>
  !(props as SingleSelectProps).isMultiSelect;

const isMultiple = (props: SingleSelectProps | MultipleSelectProps): props is MultipleSelectProps =>
  (props as MultipleSelectProps).isMultiSelect;

export const Select = <T extends SelectOption = SelectOption>(props: SingleSelectProps<T> | MultipleSelectProps<T>) => {
  const {
    id,
    label,
    error,
    helperText,
    options = [],
    isMultiSelect = false,
    value = null,
    onChange,
    required,
    markInvalid,
    dataUieName,
    wrapperCSS = {},
    ...rest
  } = props;

  const selectContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredOptionIdx, setHoveredOptionIdx] = useState(null);

  const hasError = !!error;

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

  const onToggleDropdown = () => setIsDropdownOpen(prevState => !prevState);

  const onOptionSelect = (idx: number | null) => {
    setHoveredOptionIdx(idx);

    if (idx !== null) {
      scrollToCurrentOption(idx);
    }
  };

  const onOptionChange =
    (idx: number, onCheckboxClick = false) =>
    ev => {
      scrollToCurrentOption(idx);

      if (isMultiple(props)) {
        if (onCheckboxClick) {
          ev.stopPropagation();
        }

        const {value: multipleValue, onChange: onMultipleValueChange} = props;

        if (multipleValue.some(val => val.value === options[idx].value)) {
          const filteredValues = multipleValue.filter(val => val.value !== options[idx].value);

          onMultipleValueChange(filteredValues);
        } else {
          const optionsBefore = [...multipleValue.slice(0, idx)];
          const optionsAfter = [...multipleValue.slice(idx)];

          onMultipleValueChange([...optionsBefore, options[idx], ...optionsAfter]);
        }
      }

      if (isSingle(props)) {
        props.onChange(options[idx]);
      }

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
        onOptionChange(hoveredOptionIdx, isMultiSelect);
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

  const handleOutsideClick = (event: MouseEvent) => {
    if (selectContainerRef.current && !selectContainerRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const mapCurrentValue = (currentValues = [], attr = 'label') =>
    currentValues.length > 0 ? currentValues.map(option => option[attr]).join(', ') : null;

  const selectedLabel = isMultiple(props) ? mapCurrentValue(props.value) : props.value ? props.value.label : null;
  const selectedValue = isMultiple(props)
    ? mapCurrentValue(props.value, 'value')
    : props.value
    ? props.value.value
    : null;

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

          {ArrowDown}
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
            const isSelected = isMultiple(props)
              ? props.value.some(val => val.value === option.value)
              : props.value && props.value.value === option.value;
            const isHoveredOption = hoveredOptionIdx === index;

            return (
              <li
                key={option.value}
                id={option.value.toString()}
                role="option"
                aria-selected={isHoveredOption || isSelected}
                tabIndex={-1}
                onClick={ev => {
                  if (!option.isDisabled) {
                    onOptionChange(index)(ev);
                  }
                }}
                css={(theme: Theme) =>
                  dropdownOptionStyles(
                    theme,
                    !isMultiSelect && (isSelected || isHoveredOption),
                    isMultiSelect,
                    option.isDisabled,
                  )
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
                    onChange={onOptionChange(index, true)}
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
