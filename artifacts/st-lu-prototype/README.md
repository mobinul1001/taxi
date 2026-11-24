# St Lu Taxi & Tours: prototype

React + Vite + Tailwind. `pnpm dev` to run, `pnpm build` to build.
Design notes and the record of each redesign stage are in `REDESIGN.md`; the QA scripts are in `qa/`.

## The map

`MapView` (`src/components/map.tsx`) draws every map in the app: the passenger live trip, the
booking route screen, the driver progress screen, the admin live map and the guided demo.

It has two renderers:

| renderer | what it draws | when to use it |
| --- | --- | --- |
| `svg` (default) | Saint Lucia drawn from real geography, built into the bundle | always; works with no network, no tiles, no API key |
| `leaflet` | the same routes over real OpenStreetMap tiles | when tiles are reachable |

```tsx
<MapView from="uvf" to="rodney-bay" progress={0.4} />          // offline SVG map
<MapView from="uvf" to="rodney-bay" renderer="leaflet" />      // OSM tiles, falls back to SVG
<MapView trips={activeTrips} focus="island" zoom labels />     // admin live map
```

`renderer="leaflet"` loads a test tile first and only switches if it arrives, so an offline demo
always falls back to the built-in map. Leaflet itself is a dynamic import, so `pnpm build` puts it in
its own chunk that is only fetched when the Leaflet renderer is actually used. The single-file static
preview build (`STATIC_PREVIEW=1`) sets `inlineDynamicImports`, so in that one build it is inlined.

### Map tiles

The Leaflet renderer uses OpenStreetMap's own tiles by default. OSM's public tile server is not for
production traffic. For a real deployment, use a keyed provider (MapTiler, Stadia, Thunderforest,
Mapbox) and set the template in the environment:

```
# .env
VITE_MAP_TILE_URL=https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=YOUR_KEY
```

`src/components/leaflet-map.tsx` reads `VITE_MAP_TILE_URL` and falls back to OSM when it is unset.
Keep the attribution line that the provider requires.

### Where the geography comes from

`src/assets/stlucia.map.ts` is **generated** — do not edit it by hand:

```
node scripts/build-map.mjs
```

The script (`scripts/build-map.mjs`):

1. reads the Saint Lucia boundary from `scripts/stlucia-adm0.json` (geoBoundaries gbOpen ADM0),
   falling back to `world-atlas` countries-10m if that file is missing;
2. projects it with `d3-geo`'s `geoMercator`, fitted to the 1000 x 1480 view box;
3. traces the roads along the real coastline between the real towns and pushes them inland, so the
   west coast road runs Vieux Fort, Choiseul, Soufriere, Canaries, Anse La Raye, Marigot, Castries,
   the northern spur runs Castries, Gros Islet, Cap Estate, and the east coast road runs Vieux Fort,
   Micoud, Dennery with the Barre de l'Isle link across to Castries;
4. writes the island paths, the projection constants, the places and the road polylines, already in
   view-box units.

Nothing is downloaded at build time or at run time.

`src/lib/geo.ts` holds the runtime helpers: `route()` walks the road network between two places (never
a drawn arc), `pointAt()` gives a point and a heading along it for the car marker, `placeFrom()` maps
free text like "Rodney Bay" or "Pitons and Soufriere" onto a place, and `project()` / `unproject()`
convert between lat/lng and view-box units.

Adding a place: add it to `PLACES` in `scripts/build-map.mjs` with its real latitude and longitude,
re-run the script, and add any spellings people use to `ALIASES` in `src/lib/geo.ts`.

## Before production: the sign-in is a mock

Auth is a front-end mock (hardcoded demo driver password, no passenger check). Must be rebuilt
server-side (hashed passwords, HttpOnly cookie, random expiring job tokens, CSP headers) before
production.

Concretely, what is in this prototype and must not ship:

- `DEMO_DRIVER_PASSWORD` in `src/lib/api.ts` is in the JavaScript bundle, readable by anyone.
- Driver password hashes are a single round of SHA-256 in `localStorage`; passengers are not checked
  at all, so any email and any six characters open the passenger app.
- The admin panel has no gate: `/admin` opens signed in.
- Outside-driver job tokens are sequential and never expire.
- Sample data lives in `localStorage` under `stlu-store-v3`, with no server behind it.

## Addresses and builds

`src/lib/config.ts` holds `SITE_URL`, the public address used for the canonical link, the Open Graph
and Twitter tags, the JSON-LD and the copied job links. It is a placeholder until the domain is final:
change that one line and every tag follows.

Two builds come out of the same source:

| command | output | what it is |
| --- | --- | --- |
| `VITE_HASH_ROUTER=1 BASE_PATH=./ vite build` | `dist/public` | the hosted build: ES modules, split chunks, a real stylesheet link. Serve it over http. |
| `STATIC_PREVIEW=1 VITE_HASH_ROUTER=1 BASE_PATH=./ vite build` | `dist/public` | one classic script with the CSS folded in, so `index.html` opens by double-clicking from `file://`. |

## Agency site (taxiappdevelopment.org): technical SEO setup

The agency pages are a second build of this codebase, made with `VITE_SITE=agency`. It contains only the agency pages (homepage at `/`), none of the St Lu screens, and is much smaller (about 1.4 MB against 16 MB with the St Lu photos).

```
pnpm --filter @workspace/st-lu-prototype run build:agency      # -> dist/agency
```

It needs Python 3 and Playwright with Chromium for the last step (`qa/prerender_agency.py`), which writes a real `<head>` (title, description, canonical, robots, Open Graph, Twitter, schema) into `<route>/index.html` for every page, plus `404.html`. The page body is still drawn by JavaScript.

What the build produces: `sitemap.xml` (14 landing pages, no `lastmod` because there is no reliable modification date), `robots.txt` (allow all, sitemap line), `_headers` (X-Robots-Tag `noindex, follow` on `/thank-you/` and `/404.html`, long cache for `/assets/`), `_redirects` (old homepage address to `/`), `favicon.svg`, `og-agency.jpg`, and one folder per page.

Hosting notes (the host decides these, not the code):
- Serve the files as they are, with real `404` status for unknown URLs (`404.html`). The Replit setting in `.replit-artifact/artifact.toml` rewrites every unknown URL to `index.html` with status 200, which makes missing pages look real to Google. For this build use a host that serves static files and a 404 page (Netlify, Cloudflare Pages, or similar). `_headers` and `_redirects` use the Netlify / Cloudflare Pages format; other hosts need the same rules written in their own format.
- Redirect `http` to `https` and `www.taxiappdevelopment.org` to `taxiappdevelopment.org` (one hop each, permanent) at the host or DNS level.
- Static hosts redirect `/faq` to `/faq/` by themselves. All internal links already use the trailing slash.

Search Console: add `https://taxiappdevelopment.org/` as a property, then submit `https://taxiappdevelopment.org/sitemap.xml` under Sitemaps. This has not been done.
