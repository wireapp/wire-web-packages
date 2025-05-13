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

import {ReactNode} from 'react';

import {CSSObject} from '@emotion/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import {contentStyle, itemStyle, textStyles, triggerStyles} from './DropdownMenu.styles';

export const DropdownMenu = ({children}: {children: ReactNode}) => {
  return <DropdownMenuPrimitive.Root>{children}</DropdownMenuPrimitive.Root>;
};

const DropdownMenuTrigger = ({
  children,
  asChild = false,
  cssObj,
}: {
  children: ReactNode;
  asChild?: boolean;
  cssObj?: CSSObject;
}) => {
  return (
    <DropdownMenuPrimitive.Trigger asChild={asChild} css={{...triggerStyles, ...cssObj}}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
};

DropdownMenu.Trigger = DropdownMenuTrigger;

const DropdownMenuContent = ({children}: {children: ReactNode}) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content css={contentStyle} sideOffset={6}>
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
};

DropdownMenu.Content = DropdownMenuContent;

const DropdownMenuItem = ({children}: {children: ReactNode}) => {
  return (
    <DropdownMenuPrimitive.Item css={itemStyle}>
      <span css={textStyles}>{children}</span>
    </DropdownMenuPrimitive.Item>
  );
};

DropdownMenu.Item = DropdownMenuItem;
