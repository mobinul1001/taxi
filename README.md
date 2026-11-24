# St Lu Taxi And Tours: clickable prototype

Frontend-only prototype (React + Vite + Tailwind). No real backend, payments or SMS.

## Run it
```
pnpm install
pnpm dev          # opens http://localhost:5173
```
Open `/` for the Prototype Hub: Mobile app (`/app`), Admin (`/admin`), Outside driver link, Landing, Messages, Screen index.
Demo logins: Passenger demo (Maria Thompson), Driver demo (Marcus Joseph). Admin accepts any password.

## Static preview (no install)
`static-preview/` is a ready build. You can simply double-click `static-preview/index.html` (it works from file:// with no server), or serve it with any static server, e.g. `npx serve static-preview`. To rebuild it: `STATIC_PREVIEW=1 VITE_HASH_ROUTER=1 BASE_PATH=./ pnpm --filter ./artifacts/st-lu-prototype exec vite build --outDir static-preview`.

Browser support: current Chrome, Edge, Safari 16.4+ and Firefox 128+. Older browsers show an "out of date" notice instead of a broken page.
It uses hash routes (`#/app/welcome`), so it works from any folder.

## Logo
Drop the client logo (.webp, .png or .svg) into `/attached_assets` and it is picked up automatically.
Without it the bundled `src/assets/st-lu-logo.svg` is used.

## Redesign (v4)
UI-only redesign: new design tokens, shared components and layouts. See `artifacts/st-lu-prototype/REDESIGN.md` for the brief, token tables,
screen checklist and where to drop real photos (`PHOTOS` in `src/components/art.tsx`). QA scripts are in `artifacts/st-lu-prototype/qa/`.

## The map

`artifacts/st-lu-prototype/public/map/tiles` holds the client's own MapTiler pack: 333 PNG tiles,
zoom 9 to 14, 2.9 MB, serving St. Lucia only. Nothing is fetched from the internet, so the map works
offline and on `file://`. The credit ("© MapTiler © OpenStreetMap contributors") sits behind the small
circled i at the bottom-left of every map.

Road geometry comes from the client's `routes.json`, simplified at build time into
`src/assets/routes.gen.ts` (16 routes, 6,803 points). Rebuild it with:
```
node scripts/build-routes.mjs    # routes -> src/assets/routes.gen.ts
node scripts/build-map.mjs       # island outline -> src/assets/stlucia.map.ts (SVG fallback map)
```
If a tile is missing, Leaflet falls back to the water colour, and if the whole pack is missing the app
draws the built-in SVG island map instead, so no screen ever shows a broken map.

The published preview carries 436 of the files (the artifact limit is 512): the 45 `.jpg` fallbacks are
dropped, since every browser in use supports AVIF or WebP, and so are the 77 zoom-14 tiles that are
solid sea. This zip keeps all of them.

## QA scripts
`artifacts/st-lu-prototype/qa` holds the Playwright scripts used for the gates: `e2e.py` (37 flows),
`audit.py` (overflow, tap targets, labels, clipping, text under 12px, console errors),
`contrast.py`, `shots.py`, `demoshots.py`. They run against a built `static-preview` folder.
