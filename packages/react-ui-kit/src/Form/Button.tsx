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

import {COLOR} from '../Identity';
import {defaultTransition} from '../Identity/motions';
import {Text} from '../Text';

interface ButtonProps {
  backgroundColor?: string;
  block?: boolean;
  disabled?: boolean;
  noCapital?: boolean;
}

const darkenAmount = 0.06;
const Button = Text.withComponent('button').extend<ButtonProps>`
  /* appearance */
  background-color: ${props => (props.disabled ? COLOR.DISABLED : props.backgroundColor)};
  border-radius: 8px;
  border: 0;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  display: inline-block;
  text-decoration: none;
  margin-bottom: 16px;
  touch-action: manipulation;
  ${defaultTransition}

  /* positioning */
  height: 48px;
  line-height: 48px;
  max-width: 100%;
  outline: none;
  padding: 0 32px;
  min-width: 150px;
  width: ${props => (props.block ? '100%' : 'auto')};
  &:hover,
  &:focus {
    /* appearance */
    text-decoration: none;
    background-color: ${props => (props.disabled ? COLOR.DISABLED : COLOR.shade(props.backgroundColor, darkenAmount))}
   }
`;

Button.defaultProps = {
  ...Button.defaultProps,
  backgroundColor: COLOR.BLUE,
  block: false,
  bold: true,
  center: true,
  color: COLOR.WHITE,
  disabled: false,
  noCapital: false,
  noWrap: true,
  textTransform: 'uppercase',
  truncate: true,
};

const ButtonLink = Button.withComponent('a');

export {Button, ButtonLink};
