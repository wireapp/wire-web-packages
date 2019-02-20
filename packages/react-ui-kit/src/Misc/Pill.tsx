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
import {ObjectInterpolation, jsx, keyframes} from '@emotion/core';
import React from 'react';
import {COLOR} from '../Identity';
import {DURATION, EASE} from '../Identity/motions';

export interface InternalPillProps {
  active?: boolean;
  type?: PILL_TYPE;
}
export interface PillProps extends InternalPillProps, React.HTMLAttributes<HTMLSpanElement> {}

enum PILL_TYPE {
  error = 'ERROR',
  success = 'SUCCESS',
  warning = 'WARNING',
}

const pillStyles: (props: InternalPillProps) => ObjectInterpolation<undefined> = props => {
  const backgroundColors = {
    [PILL_TYPE.error]: COLOR.RED_OPAQUE_16,
    [PILL_TYPE.success]: COLOR.GREEN_OPAQUE_16,
    [PILL_TYPE.warning]: COLOR.YELLOW_OPAQUE_16,
  };
  const pillAnimation = keyframes`
    0% {
      background-color: transparent;
    }
    100% {
      background-color: #eee;
    }
`;
  return {
    '&:first-child': {
      marginLeft: 0,
    },
    '&:last-child': {
      marginRight: 0,
    },
    animation: `${pillAnimation} ${DURATION.DEFAULT}ms ${EASE.QUART}`,
    backgroundColor: props.active ? '#eee' : props.type ? backgroundColors[props.type] : 'transparent',
    borderRadius: '160px',
    cursor: props.active ? 'default' : undefined,
    display: 'inline-block',
    fontSize: '12px',
    lineHeight: '16px',
    margin: props.type ? '12px 0 0 0' : '0 8px',
    minHeight: '32px',
    padding: '8px 24px',
    textAlign: 'center',
    textDecoration: 'none',
  };
};

const Pill = (props: PillProps) => (
  <span css={pillStyles(props)} data-uie-name="element-pill" data-uie-status={props.type} {...props} />
);

Pill.defaultProps = {
  active: false,
  type: null,
};

export {Pill, PILL_TYPE, pillStyles};
