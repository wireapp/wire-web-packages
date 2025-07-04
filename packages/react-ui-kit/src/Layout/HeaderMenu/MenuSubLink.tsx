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

import {CSSObject} from '@emotion/react';

import {Theme} from '../../Identity';
import {defaultTransition} from '../../Identity/motions/motions';
import {TextProps, textStyle} from '../../Typography';
import {QueryKeys, media} from '../../utils';

type MenuSubLinkProps<T = HTMLDivElement> = TextProps<T>;

export const menuSubLinkStyle: <T>(theme: Theme, props: MenuSubLinkProps<T>) => CSSObject = (theme, props) => ({
  ...textStyle(theme, props),
  '&:hover': {
    filter: 'brightness(70%)',
  },
  color: theme.general.color,
  cursor: 'pointer',
  fontWeight: 600,
  textDecoration: 'none',
  transition: defaultTransition,
  [media[QueryKeys.DESKTOP]]: {
    '&:first-of-type': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
    fontSize: theme.fontSizes.extraSmall,
    margin: '0 26px 0 10px',
    textTransform: 'uppercase',
  },

  [media[QueryKeys.TABLET_DOWN]]: {
    border: 'none',
    fontSize: '2rem !important',
    fontWeight: '400 !important',
    maxWidth: '480px',
    padding: '8px 24px',
    textTransform: 'none',
  },
});

export const MenuSubLink = (props: MenuSubLinkProps) => (
  <div css={(theme: Theme) => menuSubLinkStyle(theme, props)} {...props} />
);
