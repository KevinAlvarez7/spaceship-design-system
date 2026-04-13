import { fileURLToPath } from 'url';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { defineMain } from '@storybook/nextjs-vite/node';
import remarkGfm from 'remark-gfm';
import type { Plugin } from 'vite';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function compositionWritePlugin(): Plugin {
  return {
    name: 'composition-write',
    configureServer(server) {
      server.middlewares.use('/composition-write', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString()) as {
              path: string;
              replacements: { old: string; new: string }[];
            };
            const absPath = path.resolve(__dirname, '..', body.path);
            let source = readFileSync(absPath, 'utf-8');
            for (const r of body.replacements) {
              source = source.replaceAll(r.old, r.new);
            }
            writeFileSync(absPath, source, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        });
      });
    },
  };
}

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
  async viteFinal(config, { configType }) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),
    };
    if (configType === 'DEVELOPMENT') {
      config.plugins ??= [];
      (config.plugins as Plugin[]).push(compositionWritePlugin());
    }
    return config;
  },
});
