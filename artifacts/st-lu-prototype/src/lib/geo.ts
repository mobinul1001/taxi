/**
 * Geography helpers for the St. Lucia map.
 *
 * The island outline, the places and the road network are generated from real data by
 * scripts/build-map.mjs and already projected into the map view box, so nothing here downloads
 * anything or projects at render time. Routes follow the road polylines, never a drawn arc.
 */
import { PLACES, PROJ, ROAD_LOOP, ROAD_SPUR, SPUR_JOIN, VIEW, type Place, type PlaceId } from "@/assets/stlucia.map";

export { PLACES, VIEW, ROAD_LOOP, ROAD_SPUR };
export type { Place, PlaceId };

export type Pt = readonly [number, number];

/** Any lat/lng into the same view box as the generated data (d3 geoMercator, same constants). */
export function project(lat: number, lng: number): Pt {
  const rad = Math.PI / 180;
  const mercY = (deg: number) => Math.log(Math.tan(Math.PI / 4 + (deg * rad) / 2));
  return [
    PROJ.cx + PROJ.scale * (lng - PROJ.lng0) * rad,
    PROJ.cy - PROJ.scale * (mercY(lat) - mercY(PROJ.lat0)),
  ];
}

export const PLACE_IDS = Object.keys(PLACES) as PlaceId[];

const ALIASES: Record<string, PlaceId> = {
  hewanorra: "uvf", uvf: "uvf", "hewanorra airport": "uvf",
  slu: "slu", "george f. l. charles": "slu", "george f l charles": "slu", "charles airport": "slu",
  castries: "castries", "castries harbour": "castries", "port castries": "castries", "pointe seraphine": "castries",
  "rodney bay": "rodney-bay", "reduit": "rodney-bay", "rodney bay marina": "rodney-bay",
  "gros islet": "gros-islet", "pigeon island": "gros-islet",
  "cap estate": "cap-estate", "cap maison": "cap-estate",
  "marigot bay": "marigot-bay", marigot: "marigot-bay",
  soufriere: "soufriere", "soufrière": "soufriere", "sulphur springs": "soufriere",
  pitons: "pitons", "the pitons": "pitons", "gros piton": "pitons", "petit piton": "pitons",
  "anse chastanet": "anse-chastanet",
  "vieux fort": "vieux-fort",
};

/** Best-effort match from a free-text pickup or drop-off to a place on the map. */
export function placeFrom(label?: string | null): PlaceId | undefined {
  if (!label) return undefined;
  const s = label.toLowerCase().trim();
  if (ALIASES[s]) return ALIASES[s];
  for (const [key, id] of Object.entries(ALIASES)) if (s.includes(key)) return id;
  for (const id of PLACE_IDS) if (s.includes(PLACES[id].short.toLowerCase())) return id;
  return undefined;
}

/* ---------------- routing along the road network ---------------- */

const loopArc = (a: number, b: number): Pt[] => {
  const n = ROAD_LOOP.length;
  const fwd: Pt[] = []; for (let i = a; ; i = (i + 1) % n) { fwd.push(ROAD_LOOP[i]); if (i === b) break; }
  const bwd: Pt[] = []; for (let i = a; ; i = (i - 1 + n) % n) { bwd.push(ROAD_LOOP[i]); if (i === b) break; }
  return length(fwd) <= length(bwd) ? fwd : bwd;
};
const spurArc = (a: number, b: number): Pt[] => {
  const out: Pt[] = []; const step = a <= b ? 1 : -1;
  for (let i = a; ; i += step) { out.push(ROAD_SPUR[i]); if (i === b) break; }
  return out;
};

/** The driving route between two places, as points along the real roads. */
export function route(fromId?: PlaceId, toId?: PlaceId): Pt[] {
  if (!fromId || !toId || fromId === toId) return [];
  const a = PLACES[fromId], b = PLACES[toId];
  if (a.road === "loop" && b.road === "loop") return loopArc(a.i, b.i);
  if (a.road === "spur" && b.road === "spur") return spurArc(a.i, b.i);
  // one is on the northern spur: run the spur down to where it joins the loop, then along the loop
  const [s, l] = a.road === "spur" ? [a, b] : [b, a];
  const part: Pt[] = [...spurArc(s.i, 0), ...loopArc(SPUR_JOIN, l.i)];
  return a.road === "spur" ? part : part.reverse();
}

export function length(pts: readonly Pt[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}

/** Point and heading at a fraction along a polyline, for the moving car. */
export function pointAt(pts: readonly Pt[], t: number): { x: number; y: number; angle: number } {
  if (pts.length === 0) return { x: 0, y: 0, angle: 0 };
  if (pts.length === 1) return { x: pts[0][0], y: pts[0][1], angle: 0 };
  const target = Math.max(0, Math.min(1, t)) * length(pts);
  let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (run + seg >= target || i === pts.length - 1) {
      const k = seg === 0 ? 0 : Math.max(0, Math.min(1, (target - run) / seg));
      const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      return {
        x: pts[i - 1][0] + dx * k,
        y: pts[i - 1][1] + dy * k,
        angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90, // the car icon points up at 0deg
      };
    }
    run += seg;
  }
  const last = pts[pts.length - 1];
  return { x: last[0], y: last[1], angle: 0 };
}

export const toPath = (pts: readonly Pt[]): string =>
  pts.length === 0 ? "" : pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]} ${p[1]}`).join(" ");

export interface Box { x: number; y: number; w: number; h: number }

export const FULL_ISLAND: Box = { x: 0, y: 0, w: VIEW.w, h: VIEW.h };

/** A view box around some points, padded. */
export function boxAround(pts: readonly Pt[], pad = 110, minSize = 150): Box {
  if (pts.length === 0) return { x: 0, y: 0, w: VIEW.w, h: VIEW.h };
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad;
  let y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  if (x1 - x0 < minSize) { const c = (x0 + x1) / 2; x0 = c - minSize / 2; x1 = c + minSize / 2; }
  if (y1 - y0 < minSize) { const c = (y0 + y1) / 2; y0 = c - minSize / 2; y1 = c + minSize / 2; }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}



/** View-box units to kilometres, from the generated Mercator scale (for the scale bar). */
export function unitsToKm(units: number): number {
  const earth = 6371; // km
  const rad = units / PROJ.scale; // radians of longitude at the equator
  return rad * earth * Math.cos((PROJ.lat0 * Math.PI) / 180);
}

/** View-box units back to lat/lng, for the Leaflet renderer. */
export function unproject(x: number, y: number): { lat: number; lng: number } {
  const rad = Math.PI / 180;
  const mercY = (deg: number) => Math.log(Math.tan(Math.PI / 4 + (deg * rad) / 2));
  const lng = PROJ.lng0 + (x - PROJ.cx) / PROJ.scale / rad;
  const my = mercY(PROJ.lat0) - (y - PROJ.cy) / PROJ.scale;
  const lat = (2 * Math.atan(Math.exp(my)) - Math.PI / 2) / rad;
  return { lat, lng };
}


/**
 * The stretch of road a driver covers on the way TO the pickup: the road just before the pickup,
 * coming from the opposite side to the trip itself, so "on the way" shows the car approaching.
 */
export function approach(fromId?: PlaceId, toId?: PlaceId, units = 330): Pt[] {
  if (!fromId) return [];
  const a = PLACES[fromId];
  const road = a.road === "spur" ? ROAD_SPUR : ROAD_LOOP;
  const trip = route(fromId, toId);
  // walk away from the pickup in the direction the trip does NOT go
  const next = trip[1];
  const fwd = road[(a.i + 1) % road.length];
  const goBack = next && fwd && Math.hypot(fwd[0] - next[0], fwd[1] - next[1]) < 2 ? -1 : 1;
  const out: Pt[] = [road[a.i]];
  let run = 0;
  for (let n = 1; n < road.length && run < units; n++) {
    const i = a.road === "spur"
      ? Math.max(0, Math.min(road.length - 1, a.i + goBack * n))
      : (a.i + goBack * n + road.length * 2) % road.length;
    const p = road[i];
    run += Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1]);
    out.push(p);
  }
  return out.reverse(); // ends at the pickup
}
