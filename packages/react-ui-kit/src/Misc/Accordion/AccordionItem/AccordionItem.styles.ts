/*
 * Wire
 * Copyright (C) 2024 Wire Swiss GmbH
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

import {CSSObject, keyframes} from '@emotion/react';

import {COLOR_V2} from '../../../Identity/colors-v2';

const slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
`;

const slideUp = keyframes`
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
`;

export const wrapperStyles: CSSObject = {
  width: '100%',
  overflow: 'hidden',
};

export const itemStyles: CSSObject = {
  overflow: 'hidden',
  borderBottom: `1px solid var(--text-input-border)`,
  '&:last-child': {
    borderBottom: 'none',
  },
};

export const triggerStyles: CSSObject = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'none',
  padding: '16px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 500,
  color: COLOR_V2.GRAY_90,
  transition: 'background-color 0.2s ease',
  height: '48px',
};

export const contentStyles: CSSObject = {
  overflow: 'hidden',
  color: COLOR_V2.GRAY_80,
  fontSize: '14px',
  lineHeight: 1.5,
  '&[data-state="open"]': {
    animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
  '&[data-state="closed"]': {
    animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
  },
};

export const contentTextStyles: CSSObject = {
  padding: '16px',
};

export const chevronStyles: CSSObject = {
  width: '16px',
  height: '16px',
  color: COLOR_V2.GRAY_70,
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state="open"] &': {
    transform: 'rotate(180deg)',
  },
};
