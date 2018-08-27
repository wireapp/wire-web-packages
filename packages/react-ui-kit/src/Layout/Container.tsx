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

/* eslint-disable no-magic-numbers */

import styled from 'styled-components';
import media from '../mediaQueries';
import {GUTTER, WIDTH} from './sizes';
import {defaultProps} from 'recompose';

interface Level {
  lg: string;
  md: string;
  sm: string;
  xs: string;
  xxs: string;
}

interface ContainerProps {
  centerText?: boolean;
  level: keyof Level;
  verticalCenter?: boolean;
}

const LEVEL: Level = {
  lg: `max-width: ${WIDTH.DESKTOP_MAX}px;`,
  md: `max-width: ${WIDTH.TABLET_MAX}px;`,
  sm: `max-width: ${WIDTH.TABLET_MIN}px;`,
  xs: `max-width: ${WIDTH.MOBILE}px;`,
  xxs: `max-width: ${WIDTH.TINY}px;`,
};

const Container = styled.div<ContainerProps>`
  position: relative;
  margin: ${props => (props.verticalCenter ? 'auto' : '0 auto')};
  text-align: ${props => (props.centerText ? 'center' : 'left')};
  width: 100%;

  ${({level}) =>
    LEVEL[level] ||
    `${media.desktop`
            padding: 0;
            width: ${WIDTH.DESKTOP_MIN - GUTTER * 2}px;
          `};
          ${media.desktopXL`
            padding: 0;
            width: ${WIDTH.DESKTOP_MIN - GUTTER * 2}px;
          `};`}
  }};
`;

Container.defaultProps = {
  centerText: false,
  level: null,
  verticalCenter: false,
};

const ContainerLG = defaultProps({level: 'lg'})(Container);
const ContainerMD = defaultProps({level: 'md'})(Container);
const ContainerSM = defaultProps({level: 'sm'})(Container);
const ContainerXS = defaultProps({level: 'xs'})(Container);
const ContainerXXS = defaultProps({level: 'xxs'})(Container);

export {Container, ContainerLG, ContainerMD, ContainerSM, ContainerXS, ContainerXXS};
