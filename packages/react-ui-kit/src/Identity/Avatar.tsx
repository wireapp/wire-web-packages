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
import {useEffect, useState} from 'react';
import {IsInViewport, IsInViewportProps} from '../Misc/';
import {filterProps} from '../util';
import {COLOR} from './colors';
import {DURATION, EASE} from './motions';

export const DEFAULT_AVATAR_SIZE = 28;

export interface AvatarProps<T = HTMLDivElement> extends IsInViewportProps<T> {
  backgroundColor?: string;
  base64Image?: string;
  borderColor?: string;
  fetchImage?: () => void;
  forceInitials?: boolean;
  isAvatarGridItem?: boolean;
  name?: string;
  size?: number;
}

const avatarStyle: <T>(props: AvatarProps<T>) => ObjectInterpolation<undefined> = ({
  color = COLOR.WHITE,
  base64Image,
  borderColor,
  backgroundColor = COLOR.GRAY,
  size = DEFAULT_AVATAR_SIZE,
  isAvatarGridItem,
}) => {
  const BORDER_SIZE_LIMIT = 32;
  const borderSize = size > BORDER_SIZE_LIMIT ? 2 : 1;
  const borderWidth = base64Image ? 0 : borderSize;
  const fontSize = `${Math.ceil(size / 2.2)}px`;

  return {
    alignItems: 'center',
    backgroundColor: backgroundColor,
    borderRadius: isAvatarGridItem ? '0' : '50%',
    boxShadow: isAvatarGridItem ? 'none' : `inset 0 0 0 ${borderWidth}px ${borderColor}`,
    color,
    display: 'flex',
    fontSize,
    fontWeight: isAvatarGridItem ? 700 : 300,
    height: `${size}px`,
    justifyContent: 'center',
    minHeight: `${size}px`,
    minWidth: `${size}px`,
    overflow: 'hidden',
    width: `${size}px`,
  };
};

const filteredAvatarProps = (props: AvatarProps) =>
  filterProps(props, [
    'size',
    'forceInitials',
    'name',
    'base64Image',
    'borderColor',
    'backgroundColor',
    'fetchImage',
    'isAvatarGridItem',
  ]);

export const Avatar = (props: AvatarProps) => {
  const {base64Image, forceInitials, name, fetchImage, isAvatarGridItem} = props;
  const [scale, setScale] = useState(0);
  useEffect(() => {
    if (base64Image) {
      requestAnimationFrame(() => setScale(1));
    }
  }, [base64Image]);
  const getInitials = (name: string = '') =>
    name
      .split(' ')
      .map(([initial]) => initial && initial.toUpperCase())
      .join('')
      .substring(0, isAvatarGridItem ? 1 : 2);

  return (
    <IsInViewport
      checkViewportOnce
      onEnterViewport={fetchImage}
      disabled={!!base64Image}
      css={avatarStyle(props)}
      data-uie-name={!forceInitials && base64Image ? 'element-avatar-image' : 'element-avatar-initials'}
      {...filteredAvatarProps(props)}
    >
      {forceInitials || !base64Image ? (
        getInitials(name)
      ) : (
        <div
          css={{
            backgroundImage: base64Image && `url(data:image/png;base64,${base64Image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            borderRadius: isAvatarGridItem ? '0' : '50%',
            minHeight: '100%',
            minWidth: '100%',
            opacity: scale,
            transform: `scale(${scale})`,
            transition: `all ${DURATION.DEFAULT}ms ${EASE.QUART}`,
            width: '100%',
          }}
        />
      )}
    </IsInViewport>
  );
};
