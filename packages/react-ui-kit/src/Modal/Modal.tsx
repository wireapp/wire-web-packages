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
import {SVGIconProps} from '../Icon/SVGIcon';
import {COLOR} from '../Identity';
import {Theme} from '../Layout';
import {QueryKeys, media} from '../mediaQueries';
import {filterProps, noop} from '../util';
import {OverlayBackgroundProps, OverlayWrapper, overlayBackgroundStyle} from './Overlay';

export interface ModalBodyProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  fullscreen?: boolean;
  width?: number;
}

const modalBodyStyle: <T>(theme: Theme, props: ModalBodyProps<T>) => ObjectInterpolation<undefined> = (
  theme,
  {fullscreen = false, width},
) => ({
  alignItems: 'center',
  backgroundColor: COLOR.tint(theme.general.backgroundColor, 0.16),
  borderRadius: fullscreen ? 0 : '8px',
  bottom: fullscreen ? 0 : undefined,
  boxShadow: fullscreen ? 'none' : '0 16px 64px 0 rgba(0, 0, 0, 0.16)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: fullscreen ? 'center' : 'space-between',
  left: fullscreen ? 0 : undefined,
  margin: 'auto',
  position: fullscreen ? 'fixed' : 'relative',
  right: fullscreen ? 0 : undefined,
  top: fullscreen ? 0 : undefined,
  transform: 'translate3d(0, 0, 0)',
  zIndex: 9999,
  [media[QueryKeys.TABLET_DOWN]]: {
    width: width || fullscreen ? 'initial' : '100%',
  },
});

const filterModalBodyProps = (props: ModalBodyProps) => filterProps(props, ['fullscreen', 'width']);

const ModalBody = (props: ModalBodyProps) => (
  <div css={theme => modalBodyStyle(theme, props)} {...filterModalBodyProps(props)} />
);

const ModalClose = (props: SVGIconProps<SVGSVGElement>) => (
  <CloseIcon
    css={{
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'center',
      marginRight: '10px',
      marginTop: '10px',
      position: 'absolute',
      right: '10px',
      top: '10px',
    }}
    {...props}
  />
);

interface ModalContentProps {
  padding: number;
}

const ModalContent: React.FC<ModalContentProps & React.HTMLProps<HTMLDivElement>> = ({padding, ...props}) => (
  <div
    css={{
      maxWidth: '100%',
      overflowY: 'auto',
      padding,
    }}
    {...props}
  />
);

const modalBackgroundStyle: <T>(props: OverlayBackgroundProps<T>) => ObjectInterpolation<undefined> = props => ({
  ...overlayBackgroundStyle(props),
  backgroundColor: 'rgba(50, 54, 57, 0.4)',
});

const ModalBackground = (props: OverlayBackgroundProps) => <div css={modalBackgroundStyle(props)} {...props} />;

export interface ModalActionItem {
  bold: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  title: string;
}

interface ModalActions {
  actions?: ModalActionItem[];
}

const modalActionsWrapperStyles: () => ObjectInterpolation<undefined> = () => ({
  borderTop: '1px solid rgba(194, 194, 194, 0.2)',
  bottom: 0,
  display: 'flex',
  div: {
    borderRight: '1px solid rgba(194, 194, 194, 0.2)',
  },
  'div:last-child': {
    borderRight: 0,
  },
  position: 'absolute',
  width: '100%',
});

const modalActionStyles: ({bold}: {bold: boolean}) => ObjectInterpolation<undefined> = ({bold}) => ({
  color: COLOR.BLUE,
  cursor: 'pointer',
  display: 'flex',
  flex: 1,
  fontWeight: bold ? 'bold' : 'normal',
  justifyContent: 'center',
  padding: '8px 0',
});

const ModalActions: React.FC<ModalActions> = ({actions}) => (
  <div css={modalActionsWrapperStyles()}>
    {actions.map(action => (
      <div key={action.title} onClick={action.onClick} css={modalActionStyles({bold: action.bold})}>
        {action.title}
      </div>
    ))}
  </div>
);

interface ModalProps {
  actions?: ModalActionItem[];
  fixedWidth?: number;
  fullscreen?: boolean;
  onBackgroundClick?: () => void;
  onClose?: () => void;
  padding?: number;
}

export const Modal: React.SFC<ModalProps & React.HTMLProps<HTMLDivElement>> = ({
  actions = [],
  children,
  fixedWidth,
  fullscreen,
  onClose,
  padding = 40,
  onBackgroundClick,
  ...props
}) => (
  <OverlayWrapper {...props} data-uie-name="modal">
    <ModalBody fullscreen={fullscreen} width={fixedWidth}>
      <ModalContent padding={padding}>{children}</ModalContent>
      {onClose !== noop && <ModalClose onClick={onClose} data-uie-name="do-close" />}
      {actions.length > 0 && <ModalActions actions={actions} data-uie-name="modal-actions" />}
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
  actions: [],
  fullscreen: false,
  onBackgroundClick: noop,
  onClose: noop,
};
