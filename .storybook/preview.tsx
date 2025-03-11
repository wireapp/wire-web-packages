import type {Preview} from '@storybook/react';

import {withThemeFromJSXProvider} from '@storybook/addon-themes';
import {GlobalStyle} from '../src/GlobalStyle';
import {THEME_ID, ThemeProvider, themes} from '../src/Layout';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    // Add parameters to control the canvas width
    layout: {
      padding: '2rem',
    },
    viewport: {
      viewports: {
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
  },
  decorators: [
    withThemeFromJSXProvider({
      themes: {
        light: themes[THEME_ID.LIGHT],
        dark: themes[THEME_ID.DARK],
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
      GlobalStyles: GlobalStyle,
    }),
    // Add a decorator to control the story width
    Story => (
      <div style={{minWidth: '600px', padding: '1rem'}}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
