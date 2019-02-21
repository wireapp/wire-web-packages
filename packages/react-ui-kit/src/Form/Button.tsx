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
import {jsx} from '@emotion/core';
import {ObjectInterpolation} from '@emotion/styled';
import {COLOR} from '../Identity';
import {defaultTransition} from '../Identity/motions';
import {TextProps, linkStyles, textStyles} from '../Text';

interface ButtonProps<T = HTMLButtonElement> extends TextProps<T> {
  backgroundColor?: string;
  block?: boolean;
  disabled?: boolean;
  noCapital?: boolean;
}

const buttonStyles: (props: ButtonProps) => ObjectInterpolation<undefined> = props => ({
  ...textStyles,
  '&:hover, &:focus': {
    backgroundColor: props.disabled ? COLOR.DISABLED : COLOR.shade(props.backgroundColor, 0.06),
    textDecoration: 'none',
  },
  backgroundColor: props.disabled ? COLOR.DISABLED : props.backgroundColor,
  border: 0,
  borderRadius: '8px',
  cursor: props.disabled ? 'default' : 'pointer',
  display: 'inline-block',
  height: '48px',
  lineHeight: '48px',
  marginBottom: '16px',
  maxWidth: '100%',
  minWidth: '150px',
  outline: 'none',
  padding: '0 32px',
  textDecoration: 'none',
  touchAction: 'manipulation',
  transition: defaultTransition,
  width: props.block ? '100%' : 'auto',
});

const buttonLinkStyles: (props: ButtonProps) => ObjectInterpolation<undefined> = props => ({
  ...linkStyles,
  display: 'inline-block !important',
});

const Button = (props: ButtonProps) => <button css={buttonStyles(props)} {...props} />;
const ButtonLink = (props: ButtonProps) => <a css={buttonLinkStyles(props)} {...props} />;

Button.defaultProps = {
  backgroundColor: COLOR.BLUE,
  block: false,
  bold: true,
  center: true,
  color: COLOR.WHITE,
  disabled: false,
  fontSize: '16px',
  noCapital: false,
  noWrap: true,
  textTransform: 'uppercase',
  truncate: true,
};

ButtonLink.defaultProps = {
  ...Button.defaultProps,
};

export {Button, ButtonLink};
