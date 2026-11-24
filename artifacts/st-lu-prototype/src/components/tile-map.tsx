import { useEffect, useLayoutEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, Info, Minus, Plus, Route as RouteIcon } from "lucide-react";
import { alongRoad, approachRoad, placeLatLng, roadRoute, type LatLng } from "@/lib/roads";
import { PLACES, type PlaceId } from "@/assets/stlucia.map";
import { cn } from "@/lib/utils";
import type { MapViewProps } from "./map";

/**
 * The real map: MapTiler Streets tiles shipped with the prototype and served from ./map/tiles,
 * with the client's own road geometry drawn on top. No network calls: everything is local, so it
 * works from the zip, from the published preview and from the dev server.
 */

/** Relative on purpose: the page may be served from a sub-path. */
const TILES = import.meta.env.VITE_MAP_TILE_URL ?? "./map/tiles/{z}/{x}/{y}.png";
const BOUNDS = L.latLngBounds([13.69, -61.09], [14.13, -60.87]);
const TONE: Record<string, string> = { green: "#0E6B45", orange: "#F5902B", blue: "#1F6FB2", grey: "#6B7280" };
const ATTRIBUTION = "© MapTiler © OpenStreetMap contributors";

/**
 * The pack goes to zoom 14. A preview that carries fewer zooms is handled by probing one deep tile
 * once: with the full pack you get real zoom-14 detail, without it zoom 13 is scaled up.
 */
let deepest = 13;
const liveLayers = new Set<L.TileLayer>();
const liveMaps = new Set<L.Map>();
const deepProbe = new Image();
deepProbe.onload = () => {
  deepest = 14;
  for (const l of liveLayers) { l.options.maxNativeZoom = 14; l.options.maxZoom = 14; l.redraw(); }
  for (const m of liveMaps) { try { m.setMaxZoom(14); } catch { /* map already gone */ } }
};
deepProbe.src = "./map/tiles/14/5416/7553.png";

/** Leaflet throws if asked to move a map that is gone or not laid out yet. */
const usable = (m: L.Map | null): m is L.Map =>
  !!m && !!(m as unknown as { _loaded?: boolean })._loaded && !!m.getContainer()?.isConnected;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const pinIcon = (kind: "from" | "to") => L.divIcon({
  className: "",
  iconSize: [22, 22], iconAnchor: [11, 11],
  html: kind === "from"
    ? `<span style="display:block;width:22px;height:22px;border-radius:999px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"><span style="display:block;margin:5px;width:12px;height:12px;border-radius:999px;background:#0E6B45"></span></span>`
    : `<span style="display:block;width:22px;height:22px;border-radius:7px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"><span style="display:block;margin:5px;width:12px;height:12px;border-radius:4px;background:#F5902B"></span></span>`,
});

/**
 * The map tiles have town names drawn into the picture (Vieux Fort, Soufriere, Castries), and a pin sits on
 * the town it names. The tile text cannot be moved, so under every pin there is a soft blurred patch in its
 * own pane (above the tiles, below the route and the pins): the tile name there turns into a smudge and the
 * pin's own label is the only name on that spot. Pin labels win.
 */
const knockIcon = () => L.divIcon({ className: "map-knock", iconSize: [340, 72], iconAnchor: [170, 36], html: "" });

const dotIcon = () => L.divIcon({
  className: "",
  iconSize: [12, 12], iconAnchor: [6, 6],
  html: `<span style="display:block;width:12px;height:12px;border-radius:999px;background:#0E6B45;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)"></span>`,
});

const carIcon = (heading: number, colour: string, big: boolean) => L.divIcon({
  className: "",
  iconSize: big ? [30, 30] : [24, 24], iconAnchor: big ? [15, 15] : [12, 12],
  html: `<span style="display:block;width:100%;height:100%;border-radius:999px;background:#fff;border:2px solid ${colour};box-shadow:0 2px 6px rgba(0,0,0,.3);transform:rotate(${heading}deg)">
    <svg viewBox="-12 -12 24 24" width="100%" height="100%" aria-hidden="true"><path d="M0 -6 L4.2 4.6 L0 2.2 L-4.2 4.6 Z" fill="${colour}"/></svg></span>`,
});

export default function TileMap({
  from, to, progress = 0, leg, focus = "trip", insets, trips, selected, onSelect,
  zoom = false, caption = "Map preview", className, ariaLabel, showCar = true, marks, fitAll, labels = true,
}: MapViewProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<L.Layer[]>([]);
  const firstFit = useRef(true);
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [clamped, setClamped] = useState(false);
  const [full, setFull] = useState(false);
  const [info, setInfo] = useState(false);

  const pad = { top: insets?.top ?? 12, right: insets?.right ?? 12, bottom: insets?.bottom ?? 12, left: insets?.left ?? 12 };
  // When the part of the map above a sheet is short, its buttons sit in a row along the foot of it (see below).
  // The route is then framed above that row, so a pin or its label is never under a button.
  const rowStack = size.h - pad.bottom < 300;
  const fpad = { ...pad, bottom: pad.bottom + (rowStack ? 56 : 0) };

  useLayoutEffect(() => {
    if (!host.current || map.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    // Build on the next tick. A screen the user passes straight through (the booking steps) then
    // never builds a map at all, which also keeps Leaflet from tearing down mid-animation.
    const id = window.setTimeout(() => {
      if (cancelled || !host.current) return;
      const m = L.map(host.current, {
        zoomControl: false, attributionControl: false,
        minZoom: 9, maxZoom: deepest, maxBounds: BOUNDS, maxBoundsViscosity: 0.9,
        // whole-number zoom only: a fractional zoom makes the browser resample every tile, which draws a
        // hairline seam between them. Tiles are never enlarged past the deepest zoom in the pack either.
        zoomSnap: 1, zoomDelta: 1, keyboard: true,
      });
      liveMaps.add(m);
      m.createPane("knock").style.zIndex = "250";
      const tiles = L.tileLayer(TILES, { minZoom: 9, maxZoom: deepest, maxNativeZoom: deepest, updateWhenZooming: false, tileSize: 256, bounds: BOUNDS }).addTo(m);
      liveLayers.add(tiles);
      m.setView([13.91, -60.98], 10);
      m.on("zoomend moveend", () => placeRef.current());
      map.current = m;
      setReady(true);
      const stop = () => m.stop();
      window.addEventListener("pagehide", stop);
      let live = true;
      const ro = new ResizeObserver(() => {
        if (!live || !usable(map.current)) return;
        m.invalidateSize();
        setSize({ w: host.current?.clientWidth ?? 0, h: host.current?.clientHeight ?? 0 });
      });
      ro.observe(host.current);
      setSize({ w: host.current.clientWidth, h: host.current.clientHeight });
      cleanup = () => {
        // no more events, nothing in flight, then let the current frame finish before destroying:
        // Leaflet reads the map panes from queued handlers and throws once they are gone.
        live = false;
        window.removeEventListener("pagehide", stop);
        ro.disconnect();
        map.current = null;
        liveLayers.delete(tiles);
        try { m.stop(); m.off(); } catch { /* already gone */ }
        // Give anything Leaflet already queued (a tile that finishes loading, a transition end) a
        // moment to run against a map that is still whole, then destroy it. Removing it in the same
        // frame is what made Leaflet read panes that no longer existed.
        window.setTimeout(() => { try { m.remove(); } catch { /* already gone */ } }, 400);
      };
    }, 60);
    return () => { cancelled = true; window.clearTimeout(id); cleanup?.(); };
  }, []);

  const mainRoute = roadRoute(from, to);
  /** Where the car is, by leg. At pickup it sits on the start of the route, not the end. */
  const carNow = (): { at: LatLng; heading: number } | null => {
    if (!showCar) return null;
    if (leg === "to-pickup") {
      const path = approachRoad(from, to);
      return path.length > 1 ? alongRoad(path, progress) : null;
    }
    if (!mainRoute || mainRoute.coords.length < 2) return null;
    if (leg === "at-pickup") {
      const [a, b] = mainRoute.coords;
      return { at: a, heading: alongRoad([a, b], 0).heading };
    }
    if (!leg && progress <= 0) return null;
    return alongRoad(mainRoute.coords, progress);
  };

  /**
   * Named places for the island view. Each label goes on the side of its dot that is free: the preferred side
   * first, then the others, never over another label, another dot or the edge of the map. Done in screen
   * pixels, so it is redone whenever the zoom changes.
   */
  const markLayers = useRef<L.Layer[]>([]);
  const placeRef = useRef<() => void>(() => {});
  const placeMarks = () => {
    const m = map.current;
    if (!usable(m)) return;
    markLayers.current.forEach((l) => l.remove()); markLayers.current = [];
    const list = (marks ?? []).map((mk) => ({ mk, at: placeLatLng(mk.id) })).filter((x): x is { mk: NonNullable<typeof marks>[number]; at: LatLng } => !!x.at);
    if (!list.length) return;
    const W = m.getSize().x, H = m.getSize().y, CH = 26, GAP = 4;
    type R = [number, number, number, number];
    const hit = (a: R, b: R) => a[0] < b[2] + GAP && a[2] + GAP > b[0] && a[1] < b[3] + GAP && a[3] + GAP > b[1];
    const pts = list.map((x) => m.latLngToContainerPoint(x.at));
    const dots: R[] = pts.map((p) => [p.x - 8, p.y - 8, p.x + 8, p.y + 8]);
    const placed: R[] = [];
    const order = list.map((_, i) => i).sort((a, b) => pts[a].y - pts[b].y);
    const choice = new Map<number, "top" | "bottom" | "left" | "right">();
    for (const i of order) {
      const { mk } = list[i]; const p = pts[i];
      const w = mk.label.length * 7.6 + 16;
      const rect = (d: string): R => d === "right" ? [p.x + 9, p.y - CH / 2, p.x + 9 + w, p.y + CH / 2]
        : d === "left" ? [p.x - 9 - w, p.y - CH / 2, p.x - 9, p.y + CH / 2]
        : d === "top" ? [p.x - w / 2, p.y - 9 - CH, p.x + w / 2, p.y - 9]
        : [p.x - w / 2, p.y + 9, p.x + w / 2, p.y + 9 + CH];
      const cands = [mk.dir ?? "right", "right", "left", "top", "bottom"] as const;
      let pick: (typeof cands)[number] = cands[0], at: R = rect(pick);
      for (const d of cands) {
        const r = rect(d);
        const inside = r[0] >= 58 && r[2] <= W - 58 && r[1] >= 40 && r[3] <= H - 40;
        const free = !placed.some((q) => hit(r, q)) && !dots.some((q, j) => j !== i && hit(r, q));
        if (inside && free) { pick = d; at = r; break; }
      }
      placed.push(at); choice.set(i, pick);
    }
    const off: Record<string, [number, number]> = { right: [9, 0], left: [-9, 0], top: [0, -9], bottom: [0, 9] };
    list.forEach(({ mk, at }, i) => {
      const dir = choice.get(i) ?? "right";
      const k = L.marker(at, { icon: knockIcon(), keyboard: false, interactive: false, pane: "knock" }).addTo(m);
      const a = L.marker(at, { icon: dotIcon(), keyboard: false, interactive: false }).addTo(m);
      const b = L.tooltip({ permanent: true, direction: dir, offset: off[dir], className: "map-chip sm", interactive: false }).setLatLng(at).setContent(mk.label).addTo(m);
      markLayers.current.push(k, a, b);
    });
  };

  placeRef.current = placeMarks;

  // routes, pins and cars
  useEffect(() => {
    const m = map.current;
    if (!usable(m) || !ready) return;
    for (const l of layers.current) l.remove();
    layers.current = [];
    const add = <T extends L.Layer>(l: T): T => { l.addTo(m); layers.current.push(l); return l; };

    if (mainRoute && focus !== "pickup") {
      add(L.polyline(mainRoute.coords, { color: "#0A3D2B", weight: 9, opacity: 0.25, lineJoin: "round", interactive: false }));
      add(L.polyline(mainRoute.coords, { color: "#0E6B45", weight: 5, lineJoin: "round", interactive: false }));
    }
    const f = placeLatLng(from), t = placeLatLng(to);
    const name = (id?: PlaceId) => (id ? PLACES[id]?.short ?? PLACES[id]?.name : undefined);
    if (f) {
      add(L.marker(f, { icon: knockIcon(), keyboard: false, interactive: false, pane: "knock" }));
      add(L.marker(f, { icon: pinIcon("from"), keyboard: false, interactive: false }));
      if (labels && name(from)) add(L.tooltip({ permanent: true, direction: "right", offset: [12, 0], className: "map-chip", interactive: false }).setLatLng(f).setContent(name(from)!));
    }
    if (t) {
      add(L.marker(t, { icon: knockIcon(), keyboard: false, interactive: false, pane: "knock" }));
      add(L.marker(t, { icon: pinIcon("to"), keyboard: false, interactive: false }));
      if (labels && name(to)) add(L.tooltip({ permanent: true, direction: "left", offset: [-12, 0], className: "map-chip", interactive: false }).setLatLng(t).setContent(name(to)!));
    }
    // named places, for the island view: a small dot with its name beside it. Where the names go is worked
    // out by placeMarks below, because it depends on the zoom: two labels that fit at one zoom can collide at another.
    markLayers.current.forEach((l) => l.remove()); markLayers.current = [];
    placeMarks();
    const car = carNow();
    if (car) add(L.marker(car.at, { icon: carIcon(car.heading, "#0E6B45", true), keyboard: false, interactive: false, zIndexOffset: 500 }));

    for (const trip of trips ?? []) {
      const r = roadRoute(trip.from, trip.to);
      if (!r) continue;
      const on = selected === trip.id;
      const colour = TONE[trip.tone ?? "green"];
      add(L.polyline(r.coords, {
        color: colour, weight: on ? 6 : 3.5, opacity: selected && !on ? 0.35 : 0.85, lineJoin: "round",
      })).on("click", () => onSelect?.(trip.id));
      const at = alongRoad(r.coords, trip.progress ?? 0);
      const marker = add(L.marker(at.at, { icon: carIcon(at.heading, colour, on), zIndexOffset: on ? 600 : 400, title: trip.label, alt: trip.label ?? trip.id }));
      marker.on("click", () => onSelect?.(trip.id));
      if (on && trip.label) add(L.tooltip({ permanent: true, direction: "top", offset: [0, -16], className: "map-chip" }).setLatLng(at.at).setContent(trip.label));
    }
  }, [ready, from, to, progress, leg, focus, trips, selected, onSelect, showCar]);

  /**
   * Framing rules. A map that is zoomed out past about 12 shows no road names, so a long trip is
   * never framed end to end on a phone: the pickup end is shown instead and "Show full route"
   * opens the whole thing.
   */
  const frame = (opts: { animate: boolean; showFull?: boolean }) => {
    const m = map.current;
    if (!usable(m) || size.w < 20) return;
    const animate = opts.animate && !reduced();
    const tl = [fpad.left, fpad.top] as L.PointTuple;
    const br = [fpad.right, fpad.bottom] as L.PointTuple;
    const fit = (b: L.LatLngBounds, maxZoom = 14) => m.fitBounds(b, { paddingTopLeft: tl, paddingBottomRight: br, animate, duration: 0.4, maxZoom });
    // Centre on c inside the free part of the map, the part the insets leave clear, not the whole container: a pin
    // framed this way is never under the pill at the top or the control row at the foot.
    const view = (c: LatLng, z: number) => {
      const sz = m.getSize();
      const cx = fpad.left + (sz.x - fpad.left - fpad.right) / 2, cy = fpad.top + (sz.y - fpad.top - fpad.bottom) / 2;
      const target = m.unproject(m.project(L.latLng(c[0], c[1]), z).add([sz.x / 2 - cx, sz.y / 2 - cy]), z);
      m.setView(target, z, { animate, duration: 0.4 });
    };
    const padPoint = L.point(fpad.left + fpad.right, fpad.top + fpad.bottom);
    const zoomFor = (b: L.LatLngBounds) => m.getBoundsZoom(b, false, padPoint);
    const f = placeLatLng(from), t = placeLatLng(to);
    const car = carNow();
    setClamped(false);

    try {
      if (focus !== "island") m.setMinZoom(9);
      // On a short map the pin has to sit above the control row, which can mean panning past the island's
      // southern tip; the extra margin is plain sea (the container's own colour), never a gap in the land.
      m.setMaxBounds(rowStack && focus !== "island" ? BOUNDS.pad(0.3) : BOUNDS);
      if (focus === "island") {
        // The whole island, as large as the container allows, and no further out: below that the tiles that
        // carry the neighbouring islands start to show, and there is nothing else to look at.
        // Whole-number zoom leaves a tall island at 60% of the pane; a fractional zoom fills it. Only this view
        // uses one, and the tile layer is pinned to it below so the tiles stay seamless.
        const snap = m.options.zoomSnap;
        m.options.zoomSnap = 0.25;
        const z = Math.max(9, zoomFor(BOUNDS));
        m.setMinZoom(z);
        fit(BOUNDS);
        m.options.zoomSnap = snap;
        return;
      }

      if (selected && trips?.length) {
        const sel = trips.find((x) => x.id === selected);
        const r = sel && roadRoute(sel.from, sel.to);
        if (r) { fit(L.latLngBounds(r.coords)); return; }
      }
      if (trips?.length) { fit(BOUNDS); return; }

      if (leg === "at-pickup" && f) { view(f, deepest); return; }

      if (leg === "to-pickup" && f) {
        // driver and pickup together, never further out than zoom 10
        const b = L.latLngBounds(car ? [car.at, f] : [f, f]).pad(0.25);
        if (zoomFor(b) < 10) view(car ? mid(car.at, f) : f, 10); else fit(b);
        return;
      }

      if (leg === "onboard" && car) {
        // follow the car and show the road ahead of it
        const ahead = aheadOf(mainRoute?.coords ?? [], progress);
        view(ahead ?? car.at, 14);
        return;
      }

      if (focus === "pickup" && f) { view(f, 13); return; }

      if (mainRoute) {
        const b = L.latLngBounds(mainRoute.coords);
        const z = zoomFor(b);
        // fitAll (the desktop side map) always shows the whole route: the readable-roads floor is a
        // phone rule, where the map is small and the route runs off the edge
        if (z >= 12 || opts.showFull || fitAll) { fit(b); return; }
        // too long to read: show the pickup end of it and offer the whole route
        setClamped(true);
        const head = mainRoute.coords.slice(0, Math.max(2, Math.round(mainRoute.coords.length * 0.12)));
        const hb = L.latLngBounds(head);
        if (zoomFor(hb) > 13) view(f ?? head[0], 13); else fit(hb, 13);
        return;
      }
      if (f) view(f, 13);
    } catch { /* the frame went away mid-animation */ }
  };

  const fitKey = `${focus}|${leg}|${from}|${to}|${selected}|${full}|${size.w}x${size.h}|${pad.top},${pad.right},${pad.bottom},${pad.left}|${rowStack}`;
  useEffect(() => {
    if (!ready) return;
    frame({ animate: !firstFit.current, showFull: full });
    firstFit.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, fitKey]);

  // keep the car in view as it moves, without undoing the zoom the person chose
  useEffect(() => {
    const m = map.current;
    if (!usable(m) || !ready || !leg) return;
    const car = carNow();
    if (!car) return;
    try {
      if (leg === "onboard") {
        const ahead = aheadOf(mainRoute?.coords ?? [], progress);
        if (!m.getBounds().pad(-0.2).contains(car.at)) m.panTo(ahead ?? car.at, { animate: !reduced(), duration: 0.6 });
      } else if (!m.getBounds().pad(-0.25).contains(car.at)) {
        m.panTo(car.at, { animate: !reduced(), duration: 0.6 });
      }
    } catch { /* unmounted */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const label = ariaLabel ?? (from && to ? "Map of the route in St. Lucia" : "Map of St. Lucia");
  const chrome = size.w >= 260 && size.h >= 190;
  const tiny = size.w < 220 || size.h < 150;
  // The part of the map that is not under a sheet. When it is too short for four buttons stacked, they sit in
  // a row along its foot instead of running up into the pills at the top.

  return (
    <div className={cn("relative z-0 h-full w-full overflow-hidden bg-msea", className)}>
      <div ref={host} className="isolate h-full w-full" role="img" aria-label={label} />
      {/* tile text that runs off the edge of the map would show as a stray fragment ("ie"): the rim is softened */}
      <span aria-hidden className="map-rim pointer-events-none absolute inset-0 z-[450]"><i className="l" /><i className="r" /><i className="t" /><i className="b" /></span>

      {chrome && caption && <span className="pointer-events-none absolute left-2 top-2 z-[500] rounded-md bg-paper/85 px-2 py-1 text-[12px] font-semibold text-mute">{caption}</span>}

      {/* attribution lives behind a small button so it is never hidden under a sheet */}
      {!tiny && (
        <div className="absolute left-1 z-[500]" style={{ bottom: pad.bottom + 2 }}>
          <button type="button" aria-label="Map credits" aria-expanded={info} data-testid="button-map-credits"
            onClick={() => setInfo((v) => !v)}
            className="tap flex h-[52px] w-[52px] items-center justify-center text-mute">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-paper/90 shadow-e1"><Info size={13} /></span>
          </button>
          {info && (
            <span role="status" className="absolute bottom-11 left-1 w-max max-w-[220px] rounded-md bg-paper px-2 py-1.5 text-[12px] leading-snug text-mute shadow-e2">{ATTRIBUTION}</span>
          )}
        </div>
      )}

      {zoom && chrome && (
        <div className={cn("absolute right-2 z-[500] flex gap-1", rowStack ? "flex-row items-end" : "flex-col items-end")} style={{ bottom: pad.bottom + 8 }}>
          {/* its own place at the top of the zoom stack: never over a pin, a pill or another button */}
          {clamped && focus === "trip" && !full && (
            <button type="button" data-testid="button-full-route" aria-label="Show full route" title="Show full route"
              onClick={() => setFull(true)}
              className={cn("tap flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg bg-paper px-2.5 text-[13px] font-bold text-ink shadow-e2", !rowStack && "mb-1")}>
              <RouteIcon size={16} /><span className="hidden [@media(min-width:420px)]:inline">Show full route</span>
            </button>
          )}
          <button type="button" aria-label="Zoom in" onClick={() => map.current?.zoomIn()} className="tap flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2"><Plus size={18} /></button>
          <button type="button" aria-label="Zoom out" onClick={() => map.current?.zoomOut()} className="tap flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2"><Minus size={18} /></button>
          <button type="button" data-testid="button-recentre" aria-label={leg ? "Recentre on the driver" : "Recentre on the route"}
            onClick={() => frame({ animate: true, showFull: full })}
            className={cn("tap flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2", !rowStack && "mt-1")}><Crosshair size={17} /></button>
        </div>
      )}
    </div>
  );
}

const mid = (a: LatLng, b: LatLng): LatLng => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** A point a little further along the route than the car, so the view shows the road ahead. */
function aheadOf(coords: LatLng[], t: number): LatLng | null {
  if (coords.length < 2) return null;
  return alongRoad(coords, Math.min(1, t + 0.06)).at;
}
