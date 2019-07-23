/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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
import {Props as AvatarProps} from '../Identity/';
import {filterProps} from '../util';
import {Avatar} from './Avatar';
import {COLOR} from './colors';

interface Props<T = HTMLDivElement> extends React.HTMLProps<T> {
  items: AvatarProps[];
  size: number;
}

const avatarGridStyle: <T>(props: Props<T>) => ObjectInterpolation<undefined> = props => {
  return {
    alignItems: 'center',
    backgroundColor: COLOR.GRAY_DARKEN_48,
    borderRadius: '4px',
    display: 'grid',
    gridGap: 0,
    gridTemplateColumns: 'repeat(2, 1fr)',
    justifyItems: 'center',
    overflow: 'hidden',
  };
};

const filteredAvatarGridProps = (props: Props) => filterProps(props, []);

export const AvatarGrid = (props: Props) => {
  const {size} = props;
  return (
    <div css={avatarGridStyle(props)} {...filteredAvatarGridProps(props)}>
      {props.items.slice(0, 4).map(item => (
        <React.Fragment key={Math.random().toString()}>
          <Avatar
            backgroundColor={COLOR.GRAY_DARKEN_80}
            base64Image={item.base64Image}
            borderColor={item.borderColor}
            isAvatarGridItem
            name={item.name}
            size={size / 2}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
