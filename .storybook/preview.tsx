import type { Preview, Renderer } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';

import '../styles/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Radius', 'Shadow', 'Motion'],
          'Assets',
          ['Logo', 'Icons', 'Illustrations', 'Animations'],
          'Typography',
          ['Specimens'],
          'Components',
          'Patterns',
          'Playground',
        ],
      },
    },
  },
  decorators: [
    (Story) => <TooltipProvider><Story /></TooltipProvider>,
    withThemeByDataAttribute<Renderer>({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
