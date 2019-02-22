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
import media, {QueryKeys} from '../../mediaQueries';
import {Link, LinkProps, filterLinkProps, linkStyles} from '../../Text';
import {DESKTOP_HEADER_SUB_MENU_CLASSNAME} from './HeaderSubMenu';

export interface MenuLinkProps<T = HTMLAnchorElement> extends LinkProps<T> {
  button?: boolean;
}

const menuLinkStyles: (props: MenuLinkProps) => ObjectInterpolation<undefined> = props => ({
  ...linkStyles(props),
  [media[QueryKeys.DESKTOP]]: {
    '&:first-of-type': {
      marginLeft: 0,
    },
    '&:last-of-type': {
      marginRight: 0,
    },
    margin: '12px 26px 0 10px',
    [`.${DESKTOP_HEADER_SUB_MENU_CLASSNAME} &`]: {
      '&:first-of-type': {
        marginLeft: '10px',
      },
      '&:last-of-type': {
        marginRight: '26px',
      },
    },
  },
  [media[QueryKeys.TABLET_DOWN]]: {
    border: 'none',
    fontSize: '32px !important',
    fontWeight: 300,
    maxWidth: '480px',
    padding: '8px 24px',
    textTransform: 'none !important',
  },
  border: props.button ? '1px solid rgb(219, 226, 231)' : undefined,
  borderRadius: props.button ? '4px' : undefined,
  padding: props.button ? '10px 16px' : undefined,
});

const MenuLink = ({button = false, ...props}: MenuLinkProps) => (
  <a css={menuLinkStyles(props)} {...filterLinkProps(props)} />
);

MenuLink.defaultProps = {
  ...Link.defaultProps,
  button: false,
};

export {MenuLink, menuLinkStyles};
