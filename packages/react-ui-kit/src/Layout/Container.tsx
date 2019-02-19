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
import media, {QueryKeys} from '../mediaQueries';
import {GUTTER, WIDTH} from './sizes';

interface ContainerProps {
  centerText?: boolean;
  level?: keyof Level;
  verticalCenter?: boolean;
}

export interface Level {
  lg: number;
  md: number;
  sm: number;
  xs: number;
  xxs: number;
}

const LEVEL: Level = {
  lg: WIDTH.DESKTOP_MAX,
  md: WIDTH.TABLET_MAX,
  sm: WIDTH.TABLET_MIN,
  xs: WIDTH.MOBILE,
  xxs: WIDTH.TINY,
};

const containerStyles: (props: ContainerProps) => ObjectInterpolation<undefined> = props => ({
  margin: props.verticalCenter ? 'auto' : '0 auto',
  maxWidth: props.level ? `${LEVEL[props.level]}px` : undefined,
  position: 'relative',
  textAlign: props.centerText ? 'center' : 'left',
  width: '100%',
  [media[QueryKeys.DESKTOP]]: props.level
    ? undefined
    : {
        padding: 0,
        width: `${WIDTH.DESKTOP_MIN - GUTTER * 2}px`,
      },
});

const Container = (props: ContainerProps) => <div css={containerStyles(props)} {...props} />;

Container.defaultProps = {
  centerText: false,
  level: undefined,
  verticalCenter: false,
};

const ContainerLG = (props: ContainerProps) => <Container level={'lg'} {...props} />;
const ContainerMD = (props: ContainerProps) => <Container level={'md'} {...props} />;
const ContainerSM = (props: ContainerProps) => <Container level={'sm'} {...props} />;
const ContainerXS = (props: ContainerProps) => <Container level={'xs'} {...props} />;
const ContainerXXS = (props: ContainerProps) => <Container level={'xxs'} {...props} />;

export {Container, ContainerLG, ContainerMD, ContainerSM, ContainerXS, ContainerXXS};
