/**
 * Builds src/assets/stlucia.map.ts from real geographic data, at build time, with no network calls
 * at runtime and no map tiles.
 *
 *   island outline : Natural Earth / geoBoundaries ADM0 polygon for Saint Lucia (scripts/stlucia-adm0.json)
 *                    with world-atlas countries-10m as a fallback source
 *   projection     : d3-geo geoMercator, fitted to the island inside the view box
 *   roads          : the real coast road, traced along the coastline between the real towns and
 *                    pushed inland so it reads as a road rather than the shoreline, plus the
 *                    inland east-west link over Barre de l'Isle
 *
 * Everything is emitted already projected into view-box units, so the app does no projection work.
 *
 *   node scripts/build-map.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const VIEW = { w: 1000, h: 1480 };
const PAD = 28;

/* ---------- 1. island geometry ---------- */
function loadIsland() {
  const local = "scripts/stlucia-adm0.json";
  if (existsSync(local)) {
    const d = JSON.parse(readFileSync(local, "utf8"));
    const g = d.features[0].geometry;
    const rings = (g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [g.coordinates[0]]).sort((a, b) => b.length - a.length);
    return { source: "geoBoundaries ADM0 (gbOpen)", rings };
  }
  // fallback: the coarser world-atlas outline, so the build never depends on the extra file
  const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-10m.json", "utf8"));
  const fc = feature(topo, topo.objects.countries);
  const f = fc.features.find((x) => /saint lucia/i.test(x.properties?.name ?? ""));
  const g = f.geometry;
  const rings = (g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [g.coordinates[0]]).sort((a, b) => b.length - a.length);
  return { source: "world-atlas countries-10m (fallback)", rings };
}

const { source, rings } = loadIsland();
// fit on the points themselves: a polygon wound the wrong way would make d3 fit the whole globe
const geo = { type: "MultiPoint", coordinates: rings.flat() };
const projection = geoMercator().fitExtent([[PAD, PAD], [VIEW.w - PAD, VIEW.h - PAD]], geo);
const path = geoPath(projection);
const P = (lng, lat) => {
  const [x, y] = projection([lng, lat]);
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
};

/* ---------- 2. real places ---------- */
const PLACES = {
  uvf: { name: "Hewanorra Airport (UVF)", short: "UVF", lat: 13.7332, lng: -60.9526, kind: "airport" },
  slu: { name: "George F. L. Charles Airport (SLU)", short: "SLU", lat: 14.0202, lng: -60.9929, kind: "airport" },
  castries: { name: "Castries", short: "Castries", lat: 14.0101, lng: -60.9875, kind: "town" },
  "rodney-bay": { name: "Rodney Bay", short: "Rodney Bay", lat: 14.0775, lng: -60.9529, kind: "town" },
  "gros-islet": { name: "Gros Islet", short: "Gros Islet", lat: 14.0833, lng: -60.95, kind: "town" },
  "cap-estate": { name: "Cap Estate", short: "Cap Estate", lat: 14.1, lng: -60.95, kind: "town" },
  "marigot-bay": { name: "Marigot Bay", short: "Marigot Bay", lat: 13.9667, lng: -61.0217, kind: "town" },
  soufriere: { name: "Soufriere", short: "Soufriere", lat: 13.8567, lng: -61.0572, kind: "town" },
  pitons: { name: "The Pitons", short: "Pitons", lat: 13.8236, lng: -61.0585, kind: "sight" },
  "anse-chastanet": { name: "Anse Chastanet", short: "Anse Chastanet", lat: 13.865, lng: -61.075, kind: "sight" },
  "vieux-fort": { name: "Vieux Fort", short: "Vieux Fort", lat: 13.7167, lng: -60.95, kind: "town" },
};

/* ---------- 3. roads traced along the real coastline ---------- */
const ring = rings[0];
const cx = ring.reduce((a, p) => a + p[0], 0) / ring.length;
const cy = ring.reduce((a, p) => a + p[1], 0) / ring.length;
const nearest = (lng, lat) => {
  let bi = 0, bd = Infinity;
  ring.forEach((p, i) => { const d = (p[0] - lng) ** 2 + (p[1] - lat) ** 2; if (d < bd) { bd = d; bi = i; } });
  return bi;
};
/** pull a coast point inland so the road is a road, not the shoreline */
const inland = ([lng, lat], k = 0.055) => [lng + (cx - lng) * k, lat + (cy - lat) * k];

/** coastline slice from index a to index b, walking in the direction that passes through `via` */
function coastSlice(a, b, via) {
  const n = ring.length;
  const fwd = []; for (let i = a; ; i = (i + 1) % n) { fwd.push(i); if (i === b) break; }
  const bwd = []; for (let i = a; ; i = (i - 1 + n) % n) { bwd.push(i); if (i === b) break; }
  const pick = via == null ? (fwd.length <= bwd.length ? fwd : bwd) : fwd.includes(via) ? fwd : bwd;
  return pick.map((i) => ring[i]);
}

const iVieuxFort = nearest(PLACES["vieux-fort"].lng, PLACES["vieux-fort"].lat);
const iSoufriere = nearest(PLACES.soufriere.lng, PLACES.soufriere.lat);
const iCastries = nearest(PLACES.castries.lng, PLACES.castries.lat);
const iGrosIslet = nearest(PLACES["gros-islet"].lng, PLACES["gros-islet"].lat);
const iCapEstate = nearest(PLACES["cap-estate"].lng, PLACES["cap-estate"].lat);
const iDennery = nearest(-60.8833, 13.9167);

// West coast road: Vieux Fort -> Choiseul -> Soufriere -> Canaries -> Anse La Raye -> Marigot -> Castries
const west = coastSlice(iVieuxFort, iCastries, iSoufriere).map((p) => inland(p));
// North spur: Castries -> Gros Islet -> Cap Estate
const north = coastSlice(iCastries, iCapEstate, iGrosIslet).map((p) => inland(p, 0.03));
// East coast road: Vieux Fort -> Micoud -> Dennery
const east = coastSlice(iVieuxFort, iDennery, nearest(-60.9, 13.82)).map((p) => inland(p));
// Barre de l'Isle: the inland link from Dennery across to Castries
// Barre de l'Isle: the real road climbs and winds, so it is traced through more waypoints
const link = [[-60.898, 13.922], [-60.908, 13.938], [-60.922, 13.947], [-60.934, 13.957],
  [-60.944, 13.962], [-60.952, 13.971], [-60.958, 13.981], [-60.966, 13.99], [-60.975, 13.997], [-60.983, 14.003]];

const toView = (pts) => pts.map(([lng, lat]) => P(lng, lat));
const dedupe = (pts) => pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 1.5);
/** light moving average: a road bends, it does not zig-zag along every inlet of the coastline */
const smooth = (pts, passes = 2) => {
  let out = pts;
  for (let k = 0; k < passes; k++) {
    out = out.map((p, i, a) => {
      if (i === 0 || i === a.length - 1) return p;
      return [
        Number(((a[i - 1][0] + p[0] * 2 + a[i + 1][0]) / 4).toFixed(1)),
        Number(((a[i - 1][1] + p[1] * 2 + a[i + 1][1]) / 4).toFixed(1)),
      ];
    });
  }
  return out;
};

/** the road loop: Vieux Fort -> west coast -> Castries -> inland link -> east coast -> Vieux Fort */
const loop = smooth(dedupe([...toView(west), ...toView([...link].reverse()), ...toView(east).reverse()]));
const spur = smooth(dedupe(toView(north)));

/* ---------- 4. where each place sits on the network ---------- */
const anchorOn = (pts, lng, lat) => {
  const [x, y] = P(lng, lat);
  let bi = 0, bd = Infinity;
  pts.forEach((p, i) => { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; bi = i; } });
  return { i: bi, d: Math.sqrt(bd) };
};
const anchors = {};
for (const [id, pl] of Object.entries(PLACES)) {
  const a = anchorOn(loop, pl.lng, pl.lat);
  const b = anchorOn(spur, pl.lng, pl.lat);
  anchors[id] = b.d < a.d ? { road: "spur", i: b.i } : { road: "loop", i: a.i };
}
const joinIndex = (() => {
  let bi = 0, bd = Infinity;
  loop.forEach((p, i) => { const d = (p[0] - spur[0][0]) ** 2 + (p[1] - spur[0][1]) ** 2; if (d < bd) { bd = d; bi = i; } });
  return bi;
})();

/* ---------- 5. emit ---------- */
const places = Object.fromEntries(Object.entries(PLACES).map(([id, pl]) => {
  const [x, y] = P(pl.lng, pl.lat);
  return [id, { ...pl, x, y, ...anchors[id] }];
}));

const out = `/* GENERATED by scripts/build-map.mjs — do not edit by hand.
   Island outline: ${source}, projected with d3-geo geoMercator fitted to the view box.
   Roads traced along the real coastline between the real towns, pushed inland. */

export const VIEW = { w: ${VIEW.w}, h: ${VIEW.h} } as const;

/** Saint Lucia and its islets, as SVG path data in view-box units. */
export const ISLAND = ${JSON.stringify(rings.map((r) => path({ type: "LineString", coordinates: r }) + "Z"))} as const;

/** Mercator constants, for projecting any other lat/lng into the same view box. */
export const PROJ = { scale: ${projection.scale()}, cx: ${projection.translate()[0]}, cy: ${projection.translate()[1]}, lng0: ${projection.center()[0]}, lat0: ${projection.center()[1]} } as const;

export type PlaceId = ${Object.keys(PLACES).map((k) => JSON.stringify(k)).join(" | ")};
export type PlaceKind = "airport" | "town" | "sight";
export interface Place { name: string; short: string; lat: number; lng: number; x: number; y: number; kind: PlaceKind; road: "loop" | "spur"; i: number }

export const PLACES: Record<PlaceId, Place> = ${JSON.stringify(places, null, 2)} as unknown as Record<PlaceId, Place>;

/** Main road loop (Vieux Fort, west coast, Castries, Barre de l'Isle, east coast, Vieux Fort). */
export const ROAD_LOOP: ReadonlyArray<readonly [number, number]> = ${JSON.stringify(loop)} as never;
/** Northern spur (Castries, Gros Islet, Cap Estate). */
export const ROAD_SPUR: ReadonlyArray<readonly [number, number]> = ${JSON.stringify(spur)} as never;
/** Index on the loop where the spur joins. */
export const SPUR_JOIN = ${joinIndex};
`;

writeFileSync("src/assets/stlucia.map.ts", out);
console.log(`island: ${source}, rings ${rings.map((r) => r.length).join("/")}, loop ${loop.length} pts, spur ${spur.length} pts, ${out.length} bytes`);
