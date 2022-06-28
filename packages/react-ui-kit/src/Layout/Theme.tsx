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
import {COLOR_V2} from '../Identity/colors-v2';
import {filterProps} from '../util';

export enum THEME_ID {
  DARK = 'THEME_DARK',
  LIGHT = 'THEME_LIGHT',
}

export interface Theme {
  darkMode?: boolean;
  general: {
    backgroundColor: string;
    color: string;
    primaryColor?: string;
  };
  Input: {
    backgroundColor: string;
    backgroundColorDisabled: string;
    placeholderColor: string;
    labelColor: string;
  };
  select: {
    disabledColor?: string;
    contrastTextColor?: string;
    fillColor?: string;
    borderColor?: string;
  };
}

export const themes: {[themeId in THEME_ID]: Theme} = {
  [THEME_ID.LIGHT]: {
    darkMode: false,
    Input: {
      backgroundColor: COLOR.WHITE,
      backgroundColorDisabled: COLOR_V2.GRAY_20,
      placeholderColor: COLOR.GRAY_DARKEN_24,
      labelColor: COLOR_V2.GRAY_80,
    },
    general: {
      backgroundColor: COLOR.GRAY_LIGHTEN_88,
      color: COLOR.TEXT,
      primaryColor: COLOR_V2.BLUE,
    },
    select: {
      disabledColor: COLOR_V2.GRAY_70,
      contrastTextColor: COLOR.WHITE,
      borderColor: COLOR_V2.GRAY_40,
    },
  },
  [THEME_ID.DARK]: {
    darkMode: true,
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
    },
    select: {
      disabledColor: COLOR_V2.GRAY_60,
      contrastTextColor: COLOR.BLACK,
      borderColor: COLOR_V2.GRAY_90,
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
