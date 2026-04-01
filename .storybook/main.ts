import { fileURLToPath } from 'url';
import path from 'path';
import { defineMain } from '@storybook/nextjs-vite/node';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineMain({
  framework: '@storybook/nextjs-vite',
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  staticDirs: ['../public'],
  typescript: {
    tsconfigPath: './tsconfig.storybook.json',
  },
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),
    };
    return config;
  },
});
