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
import {useTheme} from '@emotion/react';
import React, {FC, ReactElement} from 'react';
import ReactSelect, {components, OptionProps, ValueContainerProps} from 'react-select';
import {StylesConfig} from 'react-select/dist/declarations/src/styles';
import {MenuProps} from 'react-select/dist/declarations/src/components/Menu';
import {StateManagerProps} from 'react-select/dist/declarations/src/useStateManager';
import {IndicatorsContainerProps} from 'react-select/dist/declarations/src/components/containers';

import {inputStyle} from './Input';
import type {Theme} from '../Layout';
import {ArrowDown} from '../Icon/ArrowDown';
import InputLabel from './InputLabel';

const customStyles = (theme: Theme, markInvalid = false) => ({
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: provided => ({
    ...provided,
  }),
  container: (provided, {isDisabled, selectProps}) => {
    const {menuIsOpen} = selectProps;

    return {
      ...inputStyle(theme, {disabled: isDisabled, markInvalid}),
      padding: 0,
      height: 'auto',
      minHeight: '48px',
      '&:-moz-focusring': {
        color: 'transparent',
        textShadow: '0 0 0 #000',
      },
      position: 'relative',
      ...(isDisabled && {
        backgroundColor: theme.Input.backgroundColorDisabled,
        color: theme.Select.disabledColor,
        cursor: 'default',
      }),
      ...(markInvalid && {
        boxShadow: `0 0 0 1px ${theme.general.dangerColor}`,
      }),
      ...(menuIsOpen && {
        boxShadow: `0 0 0 1px ${theme.general.primaryColor}`,
      }),
      ...(!menuIsOpen && {
        '&:hover': {
          boxShadow: `0 0 0 1px ${theme.Select.borderColor}`,
        },
        '&:focus, &:active': {
          boxShadow: `0 0 0 1px ${theme.general.primaryColor}`,
        },
      }),
      cursor: 'pointer',
    };
  },
  control: () => ({
    display: 'flex',
    alignItems: 'center',
    appearance: 'none',
    padding: '0 8px 0 16px',
    height: 'auto',
    minHeight: '48px',
  }),
  menu: provided => ({
    ...provided,
    boxShadow: `0 0 0 1px ${theme.general.primaryColor}, 0 4px 11px hsl(0deg 0% 0% / 10%)`,
    borderRadius: 12,
    marginBottom: 0,
    marginTop: 4,
  }),
  menuList: provided => ({
    ...provided,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  option: (provided, {isDisabled, isFocused}) => ({
    ...provided,
    padding: '10px 18px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: 300,
    lineHeight: '24px',
    ...(isFocused && {
      background: theme.general.primaryColor,
      borderColor: theme.general.primaryColor,
      color: theme.Select.contrastTextColor,
    }),
    '&:hover, &:active, &:focus': {
      background: theme.general.primaryColor,
      borderColor: theme.general.primaryColor,
      color: theme.Select.contrastTextColor,
    },
    '&:not(:last-of-type)': {
      borderBottom: `1px solid ${theme.Select.borderColor}`,
    },
    '&:first-of-type': {
      borderRadius: '12px 12px 0 0',
    },
    '&:last-of-type': {
      borderRadius: '0 0 12px 12px',
    },
  }),
  valueContainer: provided => ({
    ...provided,
    padding: 0,
    width: '100%',
    display: 'grid',
  }),
});

const DropdownIndicator = props => {
  const {menuIsOpen} = props.selectProps;

  return (
    <components.DropdownIndicator {...props}>
      {/* MarginTop for center arrow */}
      <ArrowDown css={{...(menuIsOpen ? {transform: 'rotateX(180deg)', marginTop: 2} : {marginTop: 4})}} />
    </components.DropdownIndicator>
  );
};

type Option = {
  value: string | number;
  label: string;
  description?: string;
  isDisabled?: boolean;
};

// eslint-disable-next-line react/display-name
const CustomOption = (dataUieName: string) => (props: OptionProps<Option>) => {
  const {children, data, isFocused, isMulti, isSelected} = props;

  return (
    <components.Option {...props}>
      <div
        css={{
          ...(isMulti && {
            display: 'grid',
            gridTemplateAreas: `"checkbox label"
                                ". description"`,
            gridTemplateColumns: '22px 1fr',
            columnGap: '10px',
          }),
        }}
        {...(dataUieName && {
          'data-uie-name': `option-${dataUieName}`,
          'data-uie-value': children,
        })}
      >
        {isMulti && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => null}
            css={{gridArea: 'checkbox', width: 22, height: 22, cursor: 'pointer', placeSelf: 'center'}}
          />
        )}

        <span css={{gridArea: 'label'}}>{children}</span>

        {data && data.description && (
          <p
            css={(theme: Theme) => ({
              marginBottom: 0,
              fontSize: '14px',
              color: isFocused ? theme.Select.descriptionColor : theme.Input.labelColor,
              gridArea: 'description',
            })}
          >
            {data.description}
          </p>
        )}
      </div>
    </components.Option>
  );
};

// eslint-disable-next-line react/display-name
const Menu = (dataUieName: string) => (props: MenuProps) => {
  const {children} = props;

  return (
    <components.Menu {...props}>
      <div
        {...(dataUieName && {
          'data-uie-name': `dropdown-${dataUieName}`,
        })}
      >
        {children}
      </div>
    </components.Menu>
  );
};

const renderValue = value => {
  if (Array.isArray(value)) {
    const currentValue = (i: number) => value[i].props.children;

    return (
      <div
        css={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          paddingRight: 14,
          gridArea: '1/1/2/3',
        }}
      >
        {currentValue(0)}
      </div>
    );
  }

  return value;
};

const ValueContainer = ({children, ...restProps}: ValueContainerProps<Option>) => (
  <components.ValueContainer {...restProps}>
    {renderValue(children[0])} {children[1]}
  </components.ValueContainer>
);

const IndicatorsContainer = ({children, ...restProps}: IndicatorsContainerProps<Option>) => {
  const value = restProps.getValue();
  const displaySelectedOptionsCount = Array.isArray(value) && value.length > 1;

  return (
    <components.IndicatorsContainer {...restProps}>
      {displaySelectedOptionsCount && <div css={{fontWeight: 600}}>(+{value.length - 1})</div>}

      {children}
    </components.IndicatorsContainer>
  );
};

interface CustomSelectProps extends StateManagerProps {
  id: string;
  dataUieName: string;
  wrapperCSS?: CSSObject;
  label?: string;
  helperText?: string;
  error?: ReactElement;
  required?: boolean;
  markInvalid?: boolean;
}

export const Select: FC<CustomSelectProps> = ({
  id,
  label,
  error,
  helperText,
  dataUieName,
  wrapperCSS = {},
  markInvalid = false,
  required = false,
  isMulti = false,
  ...props
}) => {
  const theme = useTheme();
  const hasError = !!error;

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
    >
      {label && (
        <InputLabel htmlFor={id} markInvalid={markInvalid} isRequired={required}>
          {label}
        </InputLabel>
      )}

      <ReactSelect
        id={id}
        styles={customStyles(theme as Theme, markInvalid) as StylesConfig}
        components={{
          DropdownIndicator,
          Option: CustomOption(dataUieName),
          Menu: Menu(dataUieName),
          ValueContainer,
          IndicatorsContainer,
        }}
        hideSelectedOptions={false}
        isSearchable={false}
        isClearable={false}
        closeMenuOnSelect={!isMulti}
        isMulti={isMulti}
        {...props}
      />

      {!hasError && helperText && (
        <p css={(theme: Theme) => ({fontSize: '12px', fontWeight: 400, color: theme.Input.labelColor, marginTop: 8})}>
          {helperText}
        </p>
      )}

      {error}
    </div>
  );
};
