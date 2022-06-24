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
import React from 'react';
import {CSSObject, jsx} from '@emotion/react';

import {GlobalStyle} from '../GlobalStyle';
import {filterProps} from '../util';
import {THEME_ID, Theme, ThemeProvider, themes} from './Theme';

export interface StyledAppContainerProps<T = HTMLDivElement> extends React.HTMLProps<T> {
  backgroundColor?: string;
  themeId?: THEME_ID;
  theme?: Theme;
}

const styledAppContainerStyle: <T>(theme: Theme, props: StyledAppContainerProps<T>) => CSSObject = (
  theme,
  {backgroundColor = theme.general.backgroundColor},
) => ({
  background: backgroundColor,
  transition: 'background 0.15s',
});

const filterStyledAppContainerProps = (props: StyledAppContainerProps) =>
  filterProps(props, ['backgroundColor', 'themeId']);

const StyledAppContainer = (props: StyledAppContainerProps) => (
  <div css={(theme: Theme) => styledAppContainerStyle(theme, props)} {...filterStyledAppContainerProps(props)} />
);

export const StyledApp = ({themeId = THEME_ID.LIGHT, children, ...props}) => (
  <ThemeProvider theme={props.theme ? props.theme : themes[themeId]}>
    <StyledAppContainer {...props}>
      <GlobalStyle />
      {children}
    </StyledAppContainer>
  </ThemeProvider>
);
