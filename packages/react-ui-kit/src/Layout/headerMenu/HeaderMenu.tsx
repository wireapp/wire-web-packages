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
import styled from '@emotion/styled';
import React from 'react';
import {MenuContent} from './MenuContent';
import {MenuItems} from './MenuItems';
import {MenuOpenButton} from './MenuOpenButton';
import {MenuScrollableItems} from './MenuScrollableItems';
import {MenuSubLink} from './MenuSubLink';

const MenuWrapper = styled.div`
  height: 64px;
`;

const MenuLogo = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  z-index: 2;
`;

interface HeaderMenuProps {
  logoElement?: React.ReactNode;
}

interface HeaderMenuState {
  isOpen?: boolean;
}

class HeaderMenu extends React.PureComponent<HeaderMenuProps & React.HTMLAttributes<HTMLDivElement>, HeaderMenuState> {
  static defaultProps: HeaderMenuProps = {
    logoElement: null,
  };

  state = {
    isOpen: false,
  };

  toggleMenu = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      this.setState(({isOpen}) => ({isOpen: !isOpen}));
    }
  };

  closeMenu = () => {
    this.setState({isOpen: false});
  };

  render() {
    const {isOpen} = this.state;
    const {children, logoElement = null, ...props} = this.props;
    return (
      <MenuWrapper {...props} data-uie-name="element-header-menu">
        <MenuContent open={isOpen}>
          <MenuLogo onClick={this.closeMenu}>{logoElement}</MenuLogo>
          <MenuItems onClick={this.closeMenu} open={isOpen}>
            <MenuScrollableItems>{children}</MenuScrollableItems>
          </MenuItems>
          <MenuOpenButton onClick={this.toggleMenu} open={isOpen} data-uie-name="do-toggle-header-menu">
            <div />
            <div />
            <div />
          </MenuOpenButton>
        </MenuContent>
      </MenuWrapper>
    );
  }
}

export {HeaderMenu};
