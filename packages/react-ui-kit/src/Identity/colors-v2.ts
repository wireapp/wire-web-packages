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

export const BASE_LIGHT_COLOR: Record<string, string> = {
  BLUE: '#0667C8',
  GREEN: '#1D7833',
  PETROL: '#01718E',
  PURPLE: '#8944AB',
  RED: '#C20013',
  AMBER: '#A25915',
};

export const BASE_DARK_COLOR: Record<string, string> = {
  BLUE: '#54A6FF',
  GREEN: '#30DB5B',
  PETROL: '#5DE6FF',
  PURPLE: '#DA8FFF',
  RED: '#FF7770',
  AMBER: '#FFD426',
};

const LIGHT_BLUE: Record<string, string> = {
  BLUE_LIGHT_50: '#e7f0fa',
  BLUE_LIGHT_100: '#cde1f4',
  BLUE_LIGHT_200: '#9bc2e9',
  BLUE_LIGHT_300: '#6aa4de',
  BLUE_LIGHT_400: '#3885d3',
  BLUE_LIGHT_500: BASE_LIGHT_COLOR.BLUE,
  BLUE_LIGHT_600: '#0552a0',
  BLUE_LIGHT_700: '#043e78',
  BLUE_LIGHT_800: '#022950',
  BLUE_LIGHT_900: '#19324D',
};

const DARK_BLUE: Record<string, string> = {
  BLUE_DARK_50: '#EEF7FF',
  BLUE_DARK_100: '#DDEDFF',
  BLUE_DARK_200: '#BBDBFF',
  BLUE_DARK_300: '#98CAFF',
  BLUE_DARK_400: '#76B8FF',
  BLUE_DARK_500: BASE_DARK_COLOR.BLUE,
  BLUE_DARK_600: '#4385CC',
  BLUE_DARK_700: '#326499',
  BLUE_DARK_800: '#224266',
  BLUE_DARK_900: '#19324D',
};

const LIGHT_GREEN: Record<string, string> = {
  GREEN_LIGHT_50: '#e8f1ea',
  GREEN_LIGHT_100: '#d2e4d6',
  GREEN_LIGHT_200: '#a5c9ad',
  GREEN_LIGHT_300: '#77ae85',
  GREEN_LIGHT_400: '#4a935c',
  GREEN_LIGHT_500: BASE_LIGHT_COLOR.GREEN,
  GREEN_LIGHT_600: '#176029',
  GREEN_LIGHT_700: '#11481f',
  GREEN_LIGHT_800: '#0c3014',
  GREEN_LIGHT_900: '#0E421B',
};

const DARK_GREEN: Record<string, string> = {
  GREEN_DARK_50: '#EBFCEF',
  GREEN_DARK_100: '#D6F8DE',
  GREEN_DARK_200: '#ACF1BD',
  GREEN_DARK_300: '#83E99D',
  GREEN_DARK_400: '#59E27C',
  GREEN_DARK_500: BASE_DARK_COLOR.GREEN,
  GREEN_DARK_600: '#26AF49',
  GREEN_DARK_700: '#1D8337',
  GREEN_DARK_800: '#135824',
  GREEN_DARK_900: '#0E421B',
};

const LIGHT_PETROL: Record<string, string> = {
  PETROL_LIGHT_50: '#e5f1f3',
  PETROL_LIGHT_100: '#cce2e7',
  PETROL_LIGHT_200: '#99c6d0',
  PETROL_LIGHT_300: '#67a9b8',
  PETROL_LIGHT_400: '#348da1',
  PETROL_LIGHT_500: BASE_LIGHT_COLOR.PETROL,
  PETROL_LIGHT_600: '#015a6e',
  PETROL_LIGHT_700: '#014352',
  PETROL_LIGHT_800: '#002d37',
  PETROL_LIGHT_900: '#1C454D',
};

const DARK_PETROL: Record<string, string> = {
  PETROL_DARK_50: '#EFFDFF',
  PETROL_DARK_100: '#DFFAFF',
  PETROL_DARK_200: '#BEF5FF',
  PETROL_DARK_300: '#9EF0FF',
  PETROL_DARK_400: '#7DEBFF',
  PETROL_DARK_500: BASE_DARK_COLOR.PETROL,
  PETROL_DARK_600: '#4AB8CC',
  PETROL_DARK_700: '#388A99',
  PETROL_DARK_800: '#255C66',
  PETROL_DARK_900: '#1C454D',
};

const LIGHT_PURPLE: Record<string, string> = {
  PURPLE_LIGHT_50: '#f4edf7',
  PURPLE_LIGHT_100: '#e7daee',
  PURPLE_LIGHT_200: '#d0b4dd',
  PURPLE_LIGHT_300: '#b88fcd',
  PURPLE_LIGHT_400: '#a169bc',
  PURPLE_LIGHT_500: BASE_LIGHT_COLOR.PURPLE,
  PURPLE_LIGHT_600: '#6e3689',
  PURPLE_LIGHT_700: '#522967',
  PURPLE_LIGHT_800: '#371b44',
  PURPLE_LIGHT_900: '#412B4D',
};

const DARK_PURPLE: Record<string, string> = {
  PURPLE_DARK_50: '#FCF4FF',
  PURPLE_DARK_100: '#F8E9FF',
  PURPLE_DARK_200: '#F0D2FF',
  PURPLE_DARK_300: '#E9BCFF',
  PURPLE_DARK_400: '#E1A5FF',
  PURPLE_DARK_500: BASE_DARK_COLOR.PURPLE,
  PURPLE_DARK_600: '#AE72CC',
  PURPLE_DARK_700: '#835699',
  PURPLE_DARK_800: '#573966',
  PURPLE_DARK_900: '#412B4D',
};

const LIGHT_RED: Record<string, string> = {
  RED_LIGHT_50: '#f9e6e8',
  RED_LIGHT_100: '#f3ccd0',
  RED_LIGHT_200: '#e799a1',
  RED_LIGHT_300: '#da6671',
  RED_LIGHT_400: '#ce3342',
  RED_LIGHT_500: BASE_LIGHT_COLOR.RED,
  RED_LIGHT_600: '#9b000f',
  RED_LIGHT_700: '#74000b',
  RED_LIGHT_800: '#4e0008',
  RED_LIGHT_900: '#4D2422',
};

const DARK_RED: Record<string, string> = {
  RED_DARK_50: '#FFF2F1',
  RED_DARK_100: '#FFE4E2',
  RED_DARK_200: '#FFC9C6',
  RED_DARK_300: '#FFADA9',
  RED_DARK_400: '#FF928D',
  RED_DARK_500: BASE_DARK_COLOR.RED,
  RED_DARK_600: '#CC5F5A',
  RED_DARK_700: '#994743',
  RED_DARK_800: '#66302D',
  RED_DARK_900: '#4D2422',
};

const LIGHT_AMBER: Record<string, string> = {
  AMBER_LIGHT_50: '#F6EEE8',
  AMBER_LIGHT_100: '#ECDED0',
  AMBER_LIGHT_200: '#DABDA1',
  AMBER_LIGHT_300: '#C79B73',
  AMBER_LIGHT_400: '#B57A44',
  AMBER_LIGHT_500: BASE_LIGHT_COLOR.AMBER,
  AMBER_LIGHT_600: '#824711',
  AMBER_LIGHT_700: '#61350D',
  AMBER_LIGHT_800: '#412408',
  AMBER_LIGHT_900: '#201204',
};

const DARK_AMBER: Record<string, string> = {
  AMBER_DARK_50: '#fffbea',
  AMBER_DARK_100: '#fff6d4',
  AMBER_DARK_200: '#ffeea8',
  AMBER_DARK_300: '#ffe57d',
  AMBER_DARK_400: '#ffdd51',
  AMBER_DARK_500: BASE_DARK_COLOR.AMBER,
  AMBER_DARK_600: '#ccaa1e',
  AMBER_DARK_700: '#997f17',
  AMBER_DARK_800: '#66550f',
  AMBER_DARK_900: '#4D400B',
};

const DARK: Record<string, string> = {
  ...DARK_BLUE,
  ...DARK_GREEN,
  ...DARK_PETROL,
  ...DARK_PURPLE,
  ...DARK_RED,
  ...DARK_AMBER,
};

const LIGHT: Record<string, string> = {
  ...LIGHT_BLUE,
  ...LIGHT_GREEN,
  ...LIGHT_PETROL,
  ...LIGHT_PURPLE,
  ...LIGHT_RED,
  ...LIGHT_AMBER,
};

const GRAYS: Record<string, string> = {
  GRAY_10: '#fafafa',
  GRAY_20: '#edeff0',
  GRAY_30: '#e5e8ea',
  GRAY_40: '#dce0e3',
  GRAY_50: '#cbced1',
  GRAY_60: '#9fa1a7',
  GRAY_70: '#676b71',
  GRAY_80: '#54585f',
  GRAY_90: '#34373d',
  GRAY_95: '#26272c',
  GRAY_100: '#17181a',
};

export const COLOR: any = {
  ...BASE_DARK_COLOR,
  ...BASE_LIGHT_COLOR,
  ...DARK,
  ...LIGHT,
  ...GRAYS,
  BLACK: '#000',
  WHITE: '#fff',
};
