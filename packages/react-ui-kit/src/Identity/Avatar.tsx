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
import {filterProps} from '../util';

interface Props<T = HTMLDivElement> extends React.HTMLProps<T> {
  size: number;
  forceInitials?: boolean;
  name: string;
  base64Image?: string;
  borderColor?: string;
  backgroundColor: string;
  fetchImage?: () => {};
}

interface State {}

const avatarStyle: <T>(props: Props<T>) => ObjectInterpolation<undefined> = props => {
  const BORDER_SIZE_LIMIT = 32;
  const {base64Image, forceInitials, borderColor, backgroundColor, size} = props;
  const borderSize = size > BORDER_SIZE_LIMIT ? 2 : 1;
  const borderWidth = base64Image ? 0 : borderSize;
  const fontSize = `${Math.ceil(size / 3)}px`;

  return {
    alignItems: 'center',
    backgroundColor: backgroundColor,
    backgroundImage: !forceInitials && `url(data:image/png;base64,${base64Image})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    borderRadius: '50%',
    boxShadow: `inset 0 0 0 ${borderWidth}px ${borderColor}`,
    color: 'white',
    display: 'flex',
    fontSize,
    justifyContent: 'center',
    maxHeight: `${size}px`,
    maxWidth: `${size}px`,
    minHeight: `${size}px`,
    minWidth: `${size}px`,
  };
};

const filteredAvatarProps = (props: Object) =>
  filterProps(props, ['size', 'forceInitials', 'name', 'base64Image', 'borderColor', 'backgroundColor', 'fetchImage']);

class Avatar extends React.PureComponent<Props, State> {
  observer: IntersectionObserver;

  element = React.createRef<HTMLDivElement>();

  getInitials = (name: string) =>
    name
      .split(' ')
      .map(([initial]) => initial && initial.toUpperCase())
      .join('');

  checkVisibility: IntersectionObserverCallback = ([{isIntersecting}]) => {
    if (isIntersecting) {
      this.observer.disconnect();
      const {base64Image, fetchImage} = this.props;
      if (!base64Image && fetchImage) {
        fetchImage();
      }
    }
  };

  componentDidMount() {
    const {fetchImage} = this.props;
    if (!fetchImage) {
      this.observer = new IntersectionObserver(this.checkVisibility);
      this.observer.observe(this.element.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  render() {
    const {base64Image, forceInitials, name} = this.props;

    return (
      <div
        ref={this.element}
        css={avatarStyle(this.props)}
        data-uie-name={!forceInitials && base64Image ? 'element-avatar-image' : 'element-avatar-initials'}
        {...filteredAvatarProps(this.props)}
      >
        {(forceInitials || !base64Image) && this.getInitials(name)}
      </div>
    );
  }
}

export {Avatar};
