/**
 * Real road geometry from the client's map-data pack.
 *
 * Route keys are directional ("UVF-RodneyBay"). A trip resolves in this order:
 *   1. the exact key
 *   2. the reverse key, with the polyline reversed
 *   3. the nearest pair of route endpoints to the two places
 *   4. nothing, and the caller falls back to the built-in SVG map
 */
import { ROAD_ROUTES, ROUTE_PLACES, type RoadRoute } from "@/assets/routes.gen";
import { PLACES, type PlaceId } from "@/lib/geo";

/** [lat, lng], the order Leaflet uses. */
export type LatLng = [number, number];

/** Our place ids to the keys used in the pack. */
const KEY: Partial<Record<PlaceId, string>> = {
  uvf: "UVF", slu: "SLU", castries: "Castries", "rodney-bay": "RodneyBay", "gros-islet": "GrosIslet",
  "cap-estate": "CapEstate", "marigot-bay": "MarigotBay", soufriere: "Soufriere", pitons: "Pitons",
  "anse-chastanet": "AnseChastanet", "vieux-fort": "UVF", // Vieux Fort is 2 km from the airport
};

const latlngOf = (key: string): LatLng | undefined => {
  const p = ROUTE_PLACES[key];
  return p ? [p[1], p[0]] : undefined;
};

export function placeLatLng(id?: PlaceId): LatLng | undefined {
  if (!id) return undefined;
  const k = KEY[id];
  const fromPack = k && latlngOf(k);
  if (fromPack) return fromPack;
  const p = PLACES[id];
  return p ? [p.lat, p.lng] : undefined;
}

const dist = (a: LatLng, b: LatLng) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * 0.97);

export interface RoadTrip { coords: LatLng[]; km: number; minutes: number; exact: boolean }

/** The driving route between two places, along the real road. */
export function roadRoute(fromId?: PlaceId, toId?: PlaceId): RoadTrip | null {
  if (!fromId || !toId) return null;
  const a = KEY[fromId], b = KEY[toId];
  if (!a || !b || a === b) return null;
  const take = (r: RoadRoute, reverse: boolean, exact: boolean): RoadTrip => ({
    coords: (reverse ? [...r.coords].reverse() : r.coords) as LatLng[],
    km: r.km, minutes: r.minutes, exact,
  });
  const direct = ROAD_ROUTES[`${a}-${b}`];
  if (direct) return take(direct, false, true);
  const reverse = ROAD_ROUTES[`${b}-${a}`];
  if (reverse) return take(reverse, true, true);

  // nothing for this pair: use the route whose ends are closest to the two places
  const from = placeLatLng(fromId), to = placeLatLng(toId);
  if (!from || !to) return null;
  let best: { r: RoadRoute; rev: boolean; d: number } | null = null;
  for (const [key, r] of Object.entries(ROAD_ROUTES)) {
    const [ka, kb] = key.split("-");
    const sa = latlngOf(ka), sb = latlngOf(kb);
    if (!sa || !sb) continue;
    const fwd = dist(from, sa) + dist(to, sb);
    const bwd = dist(from, sb) + dist(to, sa);
    const d = Math.min(fwd, bwd);
    if (!best || d < best.d) best = { r, rev: bwd < fwd, d };
  }
  return best ? take(best.r, best.rev, false) : null;
}

/** Total length of a polyline in degrees, for interpolation. */
function cum(coords: LatLng[]): number[] {
  const out = [0];
  for (let i = 1; i < coords.length; i++) out.push(out[i - 1] + dist(coords[i - 1], coords[i]));
  return out;
}

/** Position and heading a fraction of the way along a real road route. */
export function alongRoad(coords: LatLng[], t: number): { at: LatLng; heading: number } {
  if (coords.length === 0) return { at: [13.9, -60.98], heading: 0 };
  if (coords.length === 1) return { at: coords[0], heading: 0 };
  const c = cum(coords);
  const target = Math.max(0, Math.min(1, t)) * c[c.length - 1];
  let i = 1;
  while (i < c.length - 1 && c[i] < target) i++;
  const seg = c[i] - c[i - 1] || 1;
  const k = Math.max(0, Math.min(1, (target - c[i - 1]) / seg));
  const a = coords[i - 1], b = coords[i];
  const at: LatLng = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  // screen heading: y grows south, so north is 0deg and the bearing turns clockwise
  const heading = (Math.atan2((b[1] - a[1]) * 0.97, b[0] - a[0]) * 180) / Math.PI;
  return { at, heading };
}

/** The last stretch of road before the pickup, so "on the way" shows the car approaching it. */
export function approachRoad(fromId?: PlaceId, toId?: PlaceId, share = 0.18): LatLng[] {
  const trip = roadRoute(fromId, toId);
  if (!trip || trip.coords.length < 4) return [];
  // the road the driver uses to reach the pickup is the far end of the trip, driven towards the pickup
  const n = trip.coords.length;
  const cut = Math.max(2, Math.round(n * share));
  return trip.coords.slice(0, cut).reverse();
}

export const hasRoads = Object.keys(ROAD_ROUTES).length > 0;
