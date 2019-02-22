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
import Color from 'color';
import {COLOR} from '../../Identity';
import {defaultTransition} from '../../Identity/motions';
import media, {QueryKeys} from '../../mediaQueries';
import {TextProps, textStyles} from '../../Text';

interface MenuSubLinkProps<T = HTMLDivElement> extends TextProps<T> {}

const menuSubLinkStyles: (props: MenuSubLinkProps) => ObjectInterpolation<undefined> = props => ({
  ...textStyles(props),
  '&:hover': {
    color: Color(COLOR.LINK)
      .mix(Color(COLOR.BLACK), 0.16)
      .toString(),
  },
  color: COLOR.LINK,
  cursor: 'pointer',
  fontWeight: 600,
  textDecoration: 'none',
  transition: defaultTransition,
  [media[QueryKeys.DESKTOP]]: {
    '&:first-child': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
    fontSize: '11px',
    margin: '12px 26px 0 10px',
    textTransform: 'uppercase',
  },

  [media[QueryKeys.TABLET_DOWN]]: {
    border: 'none',
    fontSize: '32px !important',
    fontWeight: '300 !important',
    maxWidth: '480px',
    padding: '8px 24px',
    textTransform: 'none !important',
  },
});

const MenuSubLink = (props: MenuSubLinkProps) => <div css={menuSubLinkStyles(props)} {...props} />;

export {MenuSubLink, menuSubLinkStyles};
