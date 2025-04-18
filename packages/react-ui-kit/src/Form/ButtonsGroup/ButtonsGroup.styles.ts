/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import {CSSObject} from '@emotion/react';

export const wrapperStyles: CSSObject = {
  display: 'flex',
  alignItems: 'center',
};

export const buttonStyles: CSSObject = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  border: '1px solid var(--button-tertiary-border)',
  background: 'var(--button-tertiary-bg)',
  color: 'var(--main-color)',

  '&:focus-visible': {
    border: '1px solid var(--accent-color-focus)',
    borderRadius: '0',
    backgroundColor: 'var(--button-tertiary-hover-bg)',
    outline: 'none',
  },

  '&:hover': {
    border: '1px solid var(--button-tertiary-hover-border)',
    backgroundColor: 'var(--button-tertiary-hover-bg)',
  },

  '&:active': {
    border: '1px solid var(--accent-color-focus)',
    background: 'var(--accent-color-highlight)',
    color: 'var(--icon-primary-active-fill)',
  },
};

export const buttonLeftStyles: CSSObject = {
  borderRadius: '12px 0 0 12px',
};

export const buttonRightStyles: CSSObject = {
  borderRadius: '0 12px 12px 0',
};

export const buttonActiveStyles: CSSObject = {
  border: '1px solid var(--accent-color-focus)',
  background: 'var(--accent-color-highlight)',
  color: 'var(--icon-primary-active-fill)',
};
