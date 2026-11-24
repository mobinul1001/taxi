import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { ORIGIN, PATHS } from '../src/pages/company/routePaths';

/**
 * Build plugin for the agency site (taxiappdevelopment.org). Used only when VITE_SITE=agency.
 *
 *  - index.html: swaps the St Lu head (title, description, robots, canonical, Open Graph, Twitter, schema, icon, splash)
 *    for the agency's, and points the page at the agency entry (src/main-agency.tsx).
 *  - sitemap.xml, robots.txt, _headers, _redirects: generated from the same route list the app uses.
 *  - Removes the St Lu-only files from public/ (map tiles, photos, driver image, the old placeholder sitemap).
 */

/** Pages that belong in sitemap.xml: every indexable page, legal pages and the HTML sitemap included. Only the
 *  thank-you page is left out because it is noindex. */
const SKIP = new Set<string>(['thankYou']);

const postSlugs = () => [...fs.readFileSync(new URL('../src/pages/company/blogData.ts', import.meta.url), 'utf8').matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

/**
 * lastmod: blog posts use their own publish date. Other pages use PAGES_LASTMOD, a date edited by hand
 * when a page's content really changes (the repository history is too short to derive it honestly).
 */
const PAGES_LASTMOD = '2026-11-25';
const blogDates = () => Object.fromEntries([...fs.readFileSync(new URL('../src/pages/company/blogData.ts', import.meta.url), 'utf8').matchAll(/slug:\s*"([^"]+)"[\s\S]*?date:\s*"(\d{4}-\d{2}-\d{2})"/g)].map((m) => [m[1], m[2]]));
const lastmodOf = (u: string) => { const m = u.match(/\/blog\/([^/]+)\/$/); return (m && blogDates()[m[1]]) || PAGES_LASTMOD; };

export const sitemapUrls = () => [
  ...(Object.keys(PATHS) as (keyof typeof PATHS)[]).filter((k) => !SKIP.has(k)).map((k) => (k === 'home' ? `${ORIGIN}/` : `${ORIGIN}${PATHS[k]}`)),
];

const TITLE = 'Taxi App Development Company | TaxiAppDevelopment.org';
const DESC = 'Taxi app development company building taxi booking apps, white label and custom taxi apps, Uber-like ride-hailing platforms, driver apps and admin dashboards.';
const OG = `${ORIGIN}/og-agency.jpg`;

const head = `
    <title>${TITLE}</title>
    <meta name="description" content="${DESC}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${ORIGIN}/" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TaxiAppDevelopment.org" />
    <meta property="og:url" content="${ORIGIN}/" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:image" content="${OG}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="TaxiAppDevelopment.org: taxi app development for taxi and ride-hailing businesses" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="${OG}" />
    <link rel="icon" href="%BASE_URL%favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/svg+xml" href="%BASE_URL%favicon.svg" />
    <link rel="apple-touch-icon" href="%BASE_URL%apple-touch-icon.png" />
    <meta name="theme-color" content="#0a1330" />
    <style>
      #boot { background: #0a1330 !important; color: #fff !important; }
      #boot p, #boot .sub { color: #b8c4e6 !important; }
      #boot .dot { background: linear-gradient(135deg, #2b63ff, #22d3ee) !important; }
      #boot .bar { background: #182660 !important; } #boot .bar i { background: #2b63ff !important; }
    </style>`;

export function agencySite(): Plugin {
  let outDir = '';
  let root = '';
  return {
    name: 'agency-site',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); root = c.root; },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let h = html
          .replace(/<title>[\s\S]*?<\/title>/, '')
          .replace(/<!--\s*This is a prototype[\s\S]*?-->/, '')
          .replace(/<!--\s*Social networks[\s\S]*?-->/, '')
          .replace(/<meta name="(description|robots|theme-color)"[^>]*>\s*/g, '')
          .replace(/<meta (property="og:|name="twitter:)[^>]*>\s*/g, '')
          .replace(/<link rel="(canonical|icon|apple-touch-icon)"[^>]*>\s*/g, '')
          .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
        h = h.replace('</head>', `${head}\n  </head>`);
        h = h.replace('<span class="name">St Lu</span><span class="sub">TAXI &amp; TOURS</span>', '<span class="name">TaxiApp<b style="color:#6c9bff">Development</b></span>');
        h = h.replace('St Lu needs JavaScript to run. Please turn JavaScript on and reload.', 'TaxiAppDevelopment.org needs JavaScript to run. Please turn JavaScript on and reload.');
        return h.replace('/src/main.tsx', '/src/main-agency.tsx');
      },
    },
    closeBundle() {
      const w = (name: string, text: string) => fs.writeFileSync(path.join(outDir, name), text);
      for (const f of ['map', 'driver-marcus.svg', 'og-share.jpg', 'company-sitemap.xml']) fs.rmSync(path.join(outDir, f), { recursive: true, force: true });
      fs.cpSync(path.join(root, 'public-agency'), outDir, { recursive: true });
      w('sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        sitemapUrls().map((u) => `  <url><loc>${u}</loc><lastmod>${lastmodOf(u)}</lastmod></url>`).join('\n') + `\n</urlset>\n`);
      w('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
      w('_headers', `/thank-you/\n  X-Robots-Tag: noindex, follow\n/404.html\n  X-Robots-Tag: noindex, follow\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/st-lucia-taxi-app/*\n  X-Robots-Tag: noindex, nofollow\n`);
      // The blog is switched off: its old addresses go to the homepage instead of showing a missing page.
      w('_redirects', `/taxi-app-development-company  /  301\n/taxi-app-development-company/  /  301\n/blog  /  301\n/blog/  /  301\n/blog/*  /  301\n/uber-clone-app-development  /uber-like-taxi-app-development/  301\n/uber-clone-app-development/  /uber-like-taxi-app-development/  301\n`);
    },
  };
}
