import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

import { SITE_ORIGIN } from './src/lib/config';
import { agencySite } from './scripts/agency-site';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Sensible defaults so `pnpm dev` works with no setup (Replit still injects PORT and BASE_PATH).
const rawPort = process.env.PORT ?? '5173';

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

// STATIC_PREVIEW=1 builds a copy that opens by double-clicking index.html (file://).
// Browsers block <script type="module"> on file://, so this emits one classic script instead.
const staticPreview = process.env.STATIC_PREVIEW === '1';
const classicScript = (): Plugin => ({
  name: 'classic-script',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      const m = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
      if (!m) return html;
      return html
        .replace(m[0], '')
        .replace(/ crossorigin(="[^"]*")?/g, '')
        .replace('</body>', `<script defer src="${m[1]}"></script></body>`);
    },
  },
});

// The public address of the prototype, kept in one place in src/lib/config.ts so the meta tags, the
// JSON-LD and the share links cannot drift apart. index.html writes %SITE_URL% and this fills it in.
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) => html.replace(/%SITE_URL%/g, SITE_ORIGIN),
  },
});

// A stylesheet in the head blocks the first paint until it has downloaded, and the app's stylesheet is
// 180 kB: on a 3G connection that held the boot splash off the screen for thirteen seconds. Loading it
// with media="print" takes it off the critical path, and main.tsx waits for it before the first render,
// so nothing is ever shown unstyled. <noscript> keeps it a normal stylesheet when scripts are off.
const asyncCss = (): Plugin => ({
  name: 'async-css',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler(html) {
      return html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (tag, href) =>
        `<link rel="stylesheet" data-app-css href="${href}" media="print" onload="this.media='all'">` +
        `<noscript><link rel="stylesheet" href="${href}"></noscript>`);
    },
  },
});

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    siteUrl(),
    asyncCss(),
    ...(process.env.VITE_SITE === 'agency' ? [agencySite()] : []),
    ...(staticPreview ? [classicScript()] : []),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    ...(staticPreview
      // One classic script, opened by double-clicking index.html. Nothing can be split here: a single
      // self-contained file is the whole point, and Vite folds the CSS into it.
      ? { rollupOptions: { output: { format: 'iife' as const, inlineDynamicImports: true } } }
      // The hosted build. Modules, a real stylesheet link, and the heavy parts in their own chunks so
      // the start page does not wait for the admin panel, the guided tour and the map library.
      : {
          rollupOptions: {
            output: {
              manualChunks: (id: string) => {
                if (id.includes('node_modules')) {
                  if (/leaflet/.test(id)) return 'map';
                  if (/react-router/.test(id)) return 'router';
                  if (/[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
                  return 'vendor';
                }
                return undefined;
              },
            },
          },
        }),
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
