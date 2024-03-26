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

import * as React from 'react';

import {CSSObject} from '@emotion/react';

import {ButtonProps, filterButtonProps} from './Button';
import {buttonStyle} from './Button.styles';

import {SVGIconProps} from '../Icon/SVGIcon';
import {COLOR} from '../Identity';
import {Theme} from '../Layout';
import {childrenWithDefaultProps} from '../Misc/';

export interface RoundIconButtonProps<T = HTMLButtonElement> extends ButtonProps<T> {}

export const roundIconButtonStyle: <T>(theme: Theme, props: RoundIconButtonProps<T>) => CSSObject = (theme, props) => ({
  ...buttonStyle(theme, props),
  alignItems: 'center',
  borderRadius: '50%',
  display: 'flex',
  height: `${props.size}px`,
  justifyContent: 'center',
  lineHeight: 'initial',
  margin: '0 auto',
  minWidth: `${props.size}px`,
  padding: 0,
  width: `${props.size}px`,
});

export const RoundIconButton: React.FC<RoundIconButtonProps> = ({children, ...props}) => (
  <button css={(theme: Theme) => roundIconButtonStyle(theme, props)} {...filterButtonProps(props)}>
    {childrenWithDefaultProps<SVGSVGElement, SVGIconProps>({children, defaultProps: {color: COLOR.WHITE}})}
  </button>
);

RoundIconButton.defaultProps = {
  backgroundColor: COLOR.BLUE,
  size: 32,
};
