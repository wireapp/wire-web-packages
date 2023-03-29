/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import * as React from 'react';

import {CSSObject} from '@emotion/react';

import {Theme} from '../Layout';
import {filterProps} from '../util';

interface ToolTipProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  position?: 'top' | 'right' | 'left' | 'bottom';
  body: React.ReactNode;
}

const tooltipStyle: (theme: Theme) => CSSObject = theme => ({
  position: 'relative',
  width: 'fit-content',
  '&:hover .tooltip-content': {visibility: 'visible', opacity: 1},
  '.tooltip-content': {
    textAlign: 'center',
    visibility: 'hidden',
    opacity: 0,
    width: 'max-content',
    height: 'max-content',
    position: 'absolute',
    boxSizing: 'border-box',
    display: 'block',
    margin: '0 auto',
    padding: '4px 8px',
    backgroundColor: theme.Tooltip.backgroundColor,
    color: theme.Tooltip.color,
    borderRadius: 4,
    fontSize: '0.8em',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'opacity ease-out 150ms, bottom ease-out 150ms',
  },
  '& .tooltip-content .tooltip-arrow': {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  "&[data-position='top'] .tooltip-content": {
    bottom: '100%',
    marginBottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '1px 2px 6px rgba(0, 0, 0, 0.3)',
    '& .tooltip-arrow': {
      filter: 'drop-shadow(0px 2px 1px rgba(0, 0, 0, 0.1))',
      borderLeft: '12px solid transparent',
      borderRight: '12px solid transparent',
      borderTop: `12px solid ${theme.Tooltip.backgroundColor}`,
      top: '90%',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  },
  "&[data-position='right'] .tooltip-content": {
    left: '100%',
    top: 0,
    bottom: 0,
    margin: 'auto 0',
  },
  "&[data-position='bottom'] .tooltip-content": {top: '100%'},
  "&[data-position='left'] .tooltip-content": {
    right: '100%',
    top: 0,
    bottom: 0,
    margin: 'auto 0',
  },
});

const filterTooltipProps = (props: ToolTipProps) => filterProps(props, ['position', 'body']);

export const Tooltip = ({children, ...props}: ToolTipProps) => {
  const filteredProps = filterTooltipProps(props);
  const {body, position = 'top'} = props;

  return (
    <div
      css={(theme: Theme) => tooltipStyle(theme)}
      data-position={position}
      {...filteredProps}
      data-testid="tooltip-wrapper"
    >
      <div className="tooltip-content" data-testid="tooltip-content">
        {body}
        <div className="tooltip-arrow"></div>
      </div>
      {children}
    </div>
  );
};
