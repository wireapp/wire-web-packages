import type {Preview} from '@storybook/react';

import {withThemeFromJSXProvider} from '@storybook/addon-themes';
import {GlobalStyle} from '../src/GlobalStyle';
import {THEME_ID, ThemeProvider, themes} from '../src/Layout';

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      light: themes[THEME_ID.LIGHT],
      dark: themes[THEME_ID.DARK],
    },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: GlobalStyle,
  }),
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
