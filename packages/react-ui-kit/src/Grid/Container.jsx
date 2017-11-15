/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

/* eslint-disable no-magic-numbers */

import {GUTTER, WIDTH} from './sizes';
import styled, {css} from 'styled-components';
import media from '../mediaQueries';

const Container = styled.div`
  position: relative;
  margin: 0 auto;
  text-align: ${props => (props.center ? 'center' : 'left')};

  ${props => {
    switch (props.level) {
      case 'md':
        return css`
          max-width: ${WIDTH.TABLET_MAX}px;
        `;
      case 'sm':
        return css`
          max-width: ${WIDTH.TABLET_MIN}px;
        `;
      case 'xs':
        return css`
          max-width: ${WIDTH.MOBILE}px;
        `;
      default:
        return css`
          padding: 0 ${GUTTER * 2}px;
          ${media.desktop`
            padding: 0;
            width: ${WIDTH.DESKTOP_MIN - GUTTER * 4}px;
          `};

          ${media.desktopXL`
            padding: 0;
            width: ${WIDTH.DESKTOP_MIN - GUTTER * 4}px;
          `};
        `;
    }
  }};
`;

const ContainerMD = Container.extend``;
ContainerMD.defaultProps = {
  level: 'md',
};

const ContainerSM = Container.extend``;
ContainerSM.defaultProps = {
  level: 'sm',
};

const ContainerXS = Container.extend``;
ContainerXS.defaultProps = {
  level: 'xs',
};

export {Container, ContainerMD, ContainerSM, ContainerXS};
