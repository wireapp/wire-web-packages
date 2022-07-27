/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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
import {jsx, ThemeProvider as EmotionThemeProvider} from '@emotion/react';
import React from 'react';

import {COLOR} from '../Identity/colors';
import {COLOR_V2, BASE_DARK_COLOR, BASE_LIGHT_COLOR} from '../Identity/colors-v2';
import {filterProps} from '../util';

export enum THEME_ID {
  DARK = 'THEME_DARK',
  LIGHT = 'THEME_LIGHT',
}

export interface Theme {
  IconButton: {
    activePrimaryBgColor?: string;
    activePrimaryBorderColor?: string;
    focusBorderColor?: string;
    hoverPrimaryBgColor?: string;
    primaryActiveFillColor?: string;
    primaryBgColor?: string;
    primaryBorderColor?: string;
    primaryDisabledBgColor?: string;
    primaryDisabledBorderColor?: string;
    primaryHoverBorderColor?: string;
    secondaryActiveBorderColor?: string;
  };
  Checkbox: {
    background?: string;
    border?: string;
    borderFocused?: string;
    disableBgColor?: string;
    disableBorderColor?: string;
    disablecheckedBgColor?: string;
    invalidBorderColor?: string;
  };
  general: {
    backgroundColor: string;
    color: string;
    dangerColor?: string;
    primaryColor?: string;
  };
  Input: {
    backgroundColor: string;
    backgroundColorDisabled: string;
    placeholderColor: string;
    labelColor: string;
  };
  Select: {
    disabledColor?: string;
    contrastTextColor?: string;
    borderColor?: string;
    focusedDescriptionColor?: string;
  };
}

export const themes: {[themeId in THEME_ID]: Theme} = {
  [THEME_ID.LIGHT]: {
    IconButton: {
      activePrimaryBgColor: COLOR_V2.BLUE_LIGHT_50,
      focusBorderColor: COLOR_V2.BLUE_LIGHT_500,
      hoverPrimaryBgColor: COLOR_V2.GRAY_20,
      primaryActiveFillColor: COLOR_V2.BLUE,
      primaryBgColor: COLOR_V2.WHITE,
      primaryBorderColor: COLOR_V2.GRAY_40,
      primaryDisabledBgColor: COLOR_V2.GRAY_20,
      primaryDisabledBorderColor: COLOR_V2.GRAY_40,
      primaryHoverBorderColor: COLOR_V2.GRAY_50,
      secondaryActiveBorderColor: 'none',
    },
    Input: {
      backgroundColor: COLOR.WHITE,
      backgroundColorDisabled: COLOR_V2.GRAY_20,
      placeholderColor: COLOR.GRAY_DARKEN_24,
      labelColor: COLOR_V2.GRAY_80,
    },
    general: {
      backgroundColor: COLOR_V2.GRAY_20,
      color: COLOR.TEXT,
      primaryColor: COLOR_V2.BLUE,
      dangerColor: COLOR_V2.RED,
    },
    Select: {
      disabledColor: COLOR_V2.GRAY_70,
      contrastTextColor: COLOR.WHITE,
      borderColor: COLOR_V2.GRAY_40,
      focusedDescriptionColor: COLOR_V2.WHITE,
    },
    Checkbox: {
      background: COLOR_V2.GRAY_20,
      border: COLOR_V2.GRAY_80,
      borderFocused: BASE_LIGHT_COLOR.BLUE,
      disableBgColor: COLOR_V2.GRAY_20,
      disableBorderColor: COLOR_V2.GRAY_60,
      disablecheckedBgColor: COLOR_V2.GRAY_20,
      invalidBorderColor: BASE_LIGHT_COLOR.RED,
    },
  },
  [THEME_ID.DARK]: {
    IconButton: {
      activePrimaryBgColor: COLOR_V2.BLUE_DARK_800,
      focusBorderColor: COLOR_V2.BLUE_DARK_600,
      hoverPrimaryBgColor: COLOR_V2.GRAY_80,
      primaryActiveFillColor: COLOR.WHITE,
      primaryBgColor: COLOR_V2.GRAY_90,
      primaryBorderColor: COLOR_V2.GRAY_100,
      primaryDisabledBgColor: COLOR_V2.GRAY_95,
      primaryDisabledBorderColor: COLOR_V2.GRAY_90,
      primaryHoverBorderColor: COLOR_V2.GRAY_70,
      secondaryActiveBorderColor: COLOR_V2.BLUE_DARK_800,
    },
    Input: {
      backgroundColor: COLOR.BLACK_LIGHTEN_24,
      backgroundColorDisabled: COLOR.GRAY_100,
      placeholderColor: COLOR.GRAY_LIGHTEN_88,
      labelColor: COLOR_V2.GRAY_40,
    },
    general: {
      backgroundColor: COLOR.BLACK,
      color: COLOR.WHITE,
      primaryColor: COLOR_V2.BLUE,
      dangerColor: COLOR_V2.RED,
    },
    Select: {
      disabledColor: COLOR_V2.GRAY_60,
      contrastTextColor: COLOR.BLACK,
      borderColor: COLOR_V2.GRAY_90,
      focusedDescriptionColor: COLOR_V2.GRAY_40,
    },
    Checkbox: {
      background: COLOR_V2.GRAY_20,
      border: COLOR_V2.GRAY_60,
      borderFocused: BASE_DARK_COLOR.BLUE,
      disableBgColor: COLOR_V2.GRAY_10,
      disableBorderColor: COLOR_V2.GRAY_70,
      disablecheckedBgColor: COLOR_V2.GRAY_60,
      invalidBorderColor: BASE_DARK_COLOR.RED,
    },
  },
};

export interface ThemeProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  theme?: Theme;
}

const filterThemeProps = (props: ThemeProps) => filterProps(props, ['theme']);

export const ThemeProvider = (props: ThemeProps) => (
  <EmotionThemeProvider theme={props.theme} {...filterThemeProps(props)} />
);
