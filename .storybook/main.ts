import { fileURLToPath } from 'url';
import path from 'path';
import { defineMain } from '@storybook/nextjs-vite/node';
import remarkGfm from 'remark-gfm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineMain({
  framework: '@storybook/nextjs-vite',
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  docs: {
    autodocs: 'tag',
  },
  tags: {
    experimental: {
      defaultFilterSelection: 'exclude',
    },
  },
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
