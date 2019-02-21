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
import {GUTTER} from './sizes';

export interface InternalContentProps {}
export interface ContentProps extends InternalContentProps, React.HTMLProps<HTMLDivElement> {}

const contentStyles: (props: InternalContentProps) => ObjectInterpolation<undefined> = props => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: `0 ${GUTTER}px`,
});

const Content = (props: ContentProps) => <p css={contentStyles(props)} {...props} />;

export {Content, contentStyles};
