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

const DesktopStyledHeaderSubMenu = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  min-width: 200px;
  align-items: left;
  background-color: white;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
  border-radius: 8px;
  padding: 8px 8px;
  span {
    margin: 0px;
    padding-left: 10px !important;
    padding-right: 10px !important;
    height: 30px;
    display: flex;
    align-items: center;
    white-space: nowrap;
    &:hover {
      background-color: ${COLOR.GRAY_LIGHTEN_72};
      border-radius: 4px;
    }
  }
`;

const MobileStyledHeaderSubMenu = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  display: flex;
  flex-direction: column;
  justify-content: center;

  align-items: center;
  border-top: 1px solid ${COLOR.GRAY_LIGHTEN_72};
  margin-top: 16px;
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  * {
    font-weight: 200 !important;
  }
`;

interface HeaderSubMenuProps {
  caption: string;
  isOpen: boolean;
}

const HeaderSubMenu: React.SFC<HeaderSubMenuProps & React.HTMLAttributes<HTMLSpanElement>> = ({
  caption,
  isOpen,
  children,
  ...props
}) => {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia(`(${QUERY.desktop})`).matches;
  return (
    <MenuSubLink
      {...props}
      style={{textAlign: 'center', display: 'inline-block', position: 'relative', cursor: 'pointer'}}
    >
      <span>{caption}</span>
      <Opacity
        in={isOpen && isDesktop}
        timeout={DURATION.DEFAULT}
        style={{display: 'inline-block', position: 'absolute', left: -18, zIndex: 1, paddingTop: 20, marginTop: 10}}
        mountOnEnter={false}
        unmountOnExit={false}
      >
        <YAxisMovement
          in={isOpen && isDesktop}
          startValue={'-30px'}
          endValue={'0px'}
          style={{display: 'inline-block'}}
          timeout={DURATION.DEFAULT}
          mountOnEnter={false}
          unmountOnExit={true}
        >
          <DesktopStyledHeaderSubMenu>{children}</DesktopStyledHeaderSubMenu>
        </YAxisMovement>
      </Opacity>
      <Opacity
        in={isOpen && !isDesktop}
        timeout={DURATION.DEFAULT}
        mountOnEnter={false}
        unmountOnExit={false}
        style={{position: 'relative', display: 'block'}}
      >
        <Slide
          in={isOpen && !isDesktop}
          startValue={'-56%'}
          endValue={'0'}
          timeout={DURATION.DEFAULT}
          mountOnEnter={false}
          unmountOnExit={true}
        >
          <MobileStyledHeaderSubMenu>{children}</MobileStyledHeaderSubMenu>
        </Slide>
      </Opacity>
    </MenuSubLink>
  );
};
