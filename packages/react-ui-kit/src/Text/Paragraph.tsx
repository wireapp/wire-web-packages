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
import media, {QueryKeys} from '../mediaQueries';
import {TextProps, filterTextProps, textStyles} from './Text';

export interface ParagraphProps<T = HTMLParagraphElement> extends TextProps<T> {}

const paragraphStyles: (props: ParagraphProps) => ObjectInterpolation<undefined> = ({block = true, ...props}) => ({
  ...textStyles({block, ...props}),
  marginBottom: '16px',
  marginTop: 0,
});

const Paragraph = (props: ParagraphProps) => <p css={paragraphStyles(props)} {...filterTextProps(props)} />;

export interface LeadProps<T = HTMLParagraphElement> extends TextProps<T> {}

const leadStyles: (props: LeadProps) => ObjectInterpolation<undefined> = ({
  block = true,
  center = true,
  fontSize = '24px',
  ...props
}) => ({
  ...textStyles({block, center, fontSize, ...props}),
  marginBottom: '56px',
  marginTop: 0,
  [media[QueryKeys.MOBILE]]: {
    fontSize: '20px',
  },
});

const Lead = (props: LeadProps) => <p css={leadStyles(props)} {...filterTextProps(props)} />;

export {Paragraph, paragraphStyles, Lead, leadStyles};
