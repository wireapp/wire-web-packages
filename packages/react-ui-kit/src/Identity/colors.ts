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

import Color from 'color';

export type ColorParam = Color | string | ArrayLike<number> | number | {[key: string]: any};

const steps = [];
const percent = 100;

for (let index = 8; index < percent; index += 8) {
  steps.push(index);
}

function shade(color: ColorParam, amount = 0.08) {
  return Color(color)
    .mix(Color(BLACK), amount)
    .toString();
}

function tint(color: ColorParam, amount: number) {
  return Color(color)
    .mix(Color(WHITE), amount)
    .toString();
}

function opaque(color: ColorParam, amount: number) {
  return Color(color)
    .fade(1 - amount)
    .toString();
}

const BLACK = '#000';
const WHITE = '#fff';

const BASE_COLOR: {[index: string]: string} = {
  BLUE: '#2391d3',
  GRAY: '#bac8d1',
  GREEN: '#00c800',
  ORANGE: '#ff8900',
  RED: '#fb0807',
  YELLOW: '#febf02',
};

const DARK_COLOR: {[index: string]: string} = {};
const LIGHT_COLOR: {[index: string]: string} = {};
const OPAQUE_COLOR: {[index: string]: string} = {};

Object.entries(BASE_COLOR).forEach(([key, value]) => {
  steps.forEach(step => {
    const amount = step / percent;
    DARK_COLOR[`${key}_DARKEN_${step}`] = shade(value, amount);
    LIGHT_COLOR[`${key}_LIGHTEN_${step}`] = tint(value, amount);
    OPAQUE_COLOR[`${key}_OPAQUE_${step}`] = opaque(value, amount);
  });
});

const COMPONENT_COLOR = {
  DISABLED: opaque(DARK_COLOR.GRAY_DARKEN_32, 0.16),
  ICON: DARK_COLOR.GRAY_DARKEN_72,
  LINK: DARK_COLOR.GRAY_DARKEN_72,
  TEXT: DARK_COLOR.GRAY_DARKEN_72,
};

export const COLOR: any = {
  ...BASE_COLOR,
  ...DARK_COLOR,
  ...LIGHT_COLOR,
  ...OPAQUE_COLOR,
  ...COMPONENT_COLOR,
  BLACK,
  WHITE,
  shade,
};
