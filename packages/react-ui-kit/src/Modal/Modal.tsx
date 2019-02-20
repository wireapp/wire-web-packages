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
import {CloseIcon} from '../Icon';
import {COLOR} from '../Identity';
import media, {QueryKeys} from '../mediaQueries';
import {
  InternalOverlayBackgroundProps,
  OverlayBackgroundProps,
  OverlayWrapper,
  overlayBackgroundStyles,
} from './Overlay';

export interface InternalModalBodyProps {
  fullscreen?: boolean;
}
export interface ModalBodyProps extends InternalModalBodyProps, React.HTMLAttributes<HTMLDivElement> {}

const modalBodyStyles: (props: InternalModalBodyProps) => ObjectInterpolation<undefined> = props => ({
  alignItems: 'center',
  backgroundColor: COLOR.GRAY_LIGHTEN_88,
  borderRadius: props.fullscreen ? 0 : '8px',
  bottom: props.fullscreen ? 0 : undefined,
  boxShadow: props.fullscreen ? 'none' : '0 16px 64px 0 rgba(0, 0, 0, 0.16)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: props.fullscreen ? 'center' : 'space-between',
  left: props.fullscreen ? 0 : undefined,
  margin: 'auto',
  position: props.fullscreen ? 'fixed' : 'relative',
  right: props.fullscreen ? 0 : undefined,
  top: props.fullscreen ? 0 : undefined,
  transform: 'translate3d(0, 0, 0)',
  zIndex: 9999,
  [media[QueryKeys.TABLET_DOWN]]: {
    width: props.fullscreen ? 'initial' : '100%',
  },
});

const ModalBody = (props: ModalBodyProps) => <div css={modalBodyStyles} {...props} />;

const ModalClose = (props: React.HTMLAttributes<SVGElement>) => (
  <CloseIcon
    css={{
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      height: '40px',
      justifyContent: 'center',
      padding: '13px',
      position: 'absolute',
      right: '10px',
      top: '10px',
      width: '0px',
    }}
    {...props}
  />
);

const ModalContent = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    css={{
      maxWidth: '100%',
      overflowY: 'auto',
      padding: '40px',
    }}
    {...props}
  />
);

const modalBackgroundStyles: (props: InternalOverlayBackgroundProps) => ObjectInterpolation<undefined> = () => ({
  ...overlayBackgroundStyles,
  background: 'rgba(50, 54, 57, 0.4)',
});

const ModalBackground = (props: OverlayBackgroundProps) => <div css={modalBackgroundStyles} {...props} />;

const noop = () => {};

interface ModalProps {
  fullscreen?: boolean;
  onBackgroundClick?: () => void;
  onClose?: () => void;
}

const Modal: React.SFC<ModalProps & React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  fullscreen,
  onClose,
  onBackgroundClick,
  ...props
}) => (
  <OverlayWrapper {...props} data-uie-name="modal">
    <ModalBody fullscreen={fullscreen}>
      <ModalContent>{children}</ModalContent>
      {onClose !== noop && <ModalClose onClick={onClose} data-uie-name="do-close" />}
    </ModalBody>
    {!fullscreen && (
      <ModalBackground
        onClick={onBackgroundClick === noop ? onClose : onBackgroundClick}
        data-uie-name="modal-background"
      />
    )}
  </OverlayWrapper>
);

Modal.defaultProps = {
  fullscreen: false,
  onBackgroundClick: noop,
  onClose: noop,
};

export {Modal};
