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
import React from 'react';
import {COLOR} from '../Identity';
import {ANIMATION, DURATION, EASE} from '../Identity/motions';
import media, {QueryKeys} from '../mediaQueries';

export interface InternalOverlayWrapperProps {}
export interface OverlayWrapperProps extends InternalOverlayWrapperProps, React.HTMLAttributes<HTMLDivElement> {}

const overlayWrapperStyles: (props: InternalOverlayWrapperProps) => ObjectInterpolation<undefined> = () => ({
  bottom: 0,
  display: 'flex',
  left: 0,
  overflowY: 'auto',
  padding: '24px',
  position: 'fixed',
  right: 0,
  top: 0,
  zIndex: 9997,
});

const OverlayWrapper = (props: OverlayWrapperProps) => <div css={overlayWrapperStyles} {...props} />;

const OverlayContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    css={{
      '*': {
        color: COLOR.WHITE,
      },
      '-webkit-transform': 'translate3d(0, 0, 0)',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      margin: 'auto',
      maxWidth: '100%',
      overflowY: 'auto',
      position: 'relative',
      zIndex: 9999,
      [media[QueryKeys.TABLET_DOWN]]: {
        width: '100%',
      },
    }}
    {...props}
  />
);

export interface InternalOverlayBackgroundProps {}
export interface OverlayBackgroundProps extends InternalOverlayBackgroundProps, React.HTMLAttributes<HTMLDivElement> {}

const overlayBackgroundStyles: (props: InternalOverlayBackgroundProps) => ObjectInterpolation<undefined> = () => ({
  animation: `${ANIMATION.fadeIn} ${DURATION.PROACTIVE_SLOW}ms ${EASE.QUART}`,
  background: 'rgba(0, 0, 0, 0.88)',
  height: '100vh',
  left: '0px',
  position: 'fixed',
  top: '0px',
  width: '100vw',
  zIndex: 9998,
});

const OverlayBackground = (props: OverlayBackgroundProps) => <div css={overlayBackgroundStyles} {...props} />;

export interface InternalOverlayProps {}
export interface OverlayProps extends InternalOverlayProps, React.HTMLAttributes<HTMLDivElement> {}

const Overlay = ({children = null, ...props}: OverlayProps) => (
  <OverlayWrapper {...props} data-uie-name="modal">
    <OverlayContent>{children}</OverlayContent>
    <OverlayBackground data-uie-name="overlay-background" />
  </OverlayWrapper>
);

export {Overlay, OverlayBackground, overlayBackgroundStyles, OverlayWrapper, overlayWrapperStyles};
