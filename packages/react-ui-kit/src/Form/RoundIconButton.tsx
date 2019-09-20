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
import {ObjectInterpolation, jsx} from '@emotion/core';
import React from 'react';
import {SVGIconProps} from '../Icon/SVGIcon';
import {COLOR} from '../Identity';
import {Theme} from '../Layout';
import {ButtonProps, buttonStyle, filterButtonProps} from './Button';

export interface RoundIconButtonProps<T = HTMLButtonElement> extends ButtonProps<T> {}

export const roundIconButtonStyle: <T>(
  theme: Theme,
  props: RoundIconButtonProps<T>,
) => ObjectInterpolation<undefined> = (theme, props) => ({
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

export const RoundIconButton: React.SFC<RoundIconButtonProps> = ({children, ...props}) => (
  <button css={theme => roundIconButtonStyle(theme, props)} {...filterButtonProps(props)}>
    {React.Children.map<React.ReactNode, React.ReactNode>(children, node => {
      if (typeof node === 'string') {
        return node;
      }
      if (!React.isValidElement<SVGIconProps>(node)) {
        console.error('Invalid children', node);
        return node;
      }

      const elementChild: React.ReactElement<SVGIconProps> = node;
      return React.cloneElement<SVGIconProps>(elementChild, {color: COLOR.WHITE, ...elementChild.props});
    })}
  </button>
);

RoundIconButton.defaultProps = {
  backgroundColor: COLOR.BLUE,
  size: 32,
};
