import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Minus, Navigation, Plus } from "lucide-react";
import { ISLAND } from "@/assets/stlucia.map";
import { approach, boxAround, FULL_ISLAND, PLACES, PLACE_IDS, pointAt, ROAD_LOOP, ROAD_SPUR, route, toPath, unitsToKm, type Box, type PlaceId, type Pt } from "@/lib/geo";
import { cn } from "@/lib/utils";

export type MapTone = "green" | "orange" | "blue" | "grey";
export interface MapTrip {
  id: string;
  from?: PlaceId;
  to?: PlaceId;
  /** 0 at pickup, 1 at drop-off */
  progress?: number;
  tone?: MapTone;
  label?: string;
}

export interface MapViewProps {
  /** single trip (passenger live screen, driver progress, guided demo) */
  from?: PlaceId;
  to?: PlaceId;
  progress?: number;
  /** several trips at once (admin live map) */
  trips?: MapTrip[];
  selected?: string;
  onSelect?: (id: string) => void;
  /**
   * What the map frames.
   *  trip   - pickup, drop-off and the car (default)
   *  leg    - the car and its next stop, so the phone shows real road detail
   *  pickup - the area around the pickup, before a drop-off is chosen
   *  island - the whole island (admin desktop)
   */
  focus?: "trip" | "leg" | "pickup" | "island" | "route";
  /** which leg the driver is on; also decides where the car sits */
  leg?: "to-pickup" | "at-pickup" | "onboard";
  /** false before a driver is assigned: only the pins and the route are shown */
  showCar?: boolean;
  /** space to keep clear, in CSS pixels: a bottom sheet, a top bar, a floating pill */
  insets?: { top?: number; right?: number; bottom?: number; left?: number };
  labels?: boolean;
  /** small labelled dots for named places, used by the desktop side map */
  marks?: { id: PlaceId; label: string; dir?: "top" | "bottom" | "left" | "right" }[];
  /** fit whatever is on the map even if that means zooming out past the readable-roads floor */
  fitAll?: boolean;
  zoom?: boolean;
  /** small chip in the corner; defaults to "Map preview" */
  caption?: string | null;
  /**
   * "tiles" (default) is the real map: the MapTiler tiles shipped with the prototype plus the
   * client's road geometry. "svg" is the built-in drawn map, used when a tile cannot be loaded.
   */
  renderer?: "tiles" | "svg";
  className?: string;
  ariaLabel?: string;
}

const ROADS = { loop: toPath(ROAD_LOOP), spur: toPath(ROAD_SPUR) };

export const TONE: Record<MapTone, string> = { green: "var(--color-green)", orange: "var(--color-orange)", blue: "#1F6FB2", grey: "var(--color-mute)" };
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smoothly eases the drawn view box towards the target box. */
function useEasedBox(target: Box): Box {
  const [box, setBox] = useState(target);
  const raf = useRef(0);
  const from = useRef(target);
  const start = useRef(0);
  useEffect(() => {
    if (reduced()) { setBox(target); return; }
    cancelAnimationFrame(raf.current);
    from.current = box;
    start.current = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start.current) / 420);
      const e = 1 - (1 - t) ** 3;
      const a = from.current;
      setBox({ x: a.x + (target.x - a.x) * e, y: a.y + (target.y - a.y) * e, w: a.w + (target.w - a.w) * e, h: a.h + (target.h - a.h) * e });
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x, target.y, target.w, target.h]);
  return box;
}

export function MapView({
  from, to, progress = 0, trips, selected, onSelect,
  focus = "trip", leg, insets, showCar = true, labels = true, zoom = false, caption = "Map preview", marks, fitAll,
  renderer = "tiles", className, ariaLabel,
}: MapViewProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [z, setZ] = useState(0); // zoom steps, each 1.45x
  const [tiles, setTiles] = useState<"unknown" | "ok" | "off">(renderer === "tiles" ? (tilesProbe ?? "unknown") : "off");

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // the real map is used only when a tile actually loads; otherwise the built-in map takes over
  useEffect(() => {
    if (renderer !== "tiles" || tilesProbe) return;
    let alive = true;
    const img = new Image();
    const done = (v: "ok" | "off") => { tilesProbe = v; if (alive) setTiles(v); };
    img.onload = () => done("ok");
    img.onerror = () => done("off");
    img.src = PROBE_TILE;
    return () => { alive = false; img.onload = img.onerror = null; };
  }, [renderer]);

  const main = useMemo(() => route(from, to), [from, to]);
  // on the way to the pickup the car is on the road BEFORE the pickup, not part-way to the drop-off
  const approachPath = useMemo(() => (leg === "to-pickup" ? approach(from, to) : []), [leg, from, to]);
  const carPath = approachPath.length > 1 ? approachPath : main;
  const carT = leg === "at-pickup" ? 1 : progress;
  const tripRoutes = useMemo(() => (trips ?? []).map((t) => ({ trip: t, pts: route(t.from, t.to) })), [trips]);

  const car = showCar && carPath.length ? pointAt(carPath, carT) : null;

  const base = useMemo<Box>(() => {
    if (focus === "island") return FULL_ISLAND;
    const pts: Pt[] = [];
    const add = (p?: Pt | null) => { if (p) pts.push(p); };
    if (focus === "leg" && car) {
      // the car and the stop it is driving to: close enough to read the roads
      add([car.x, car.y]);
      const stop = leg === "onboard" ? to : from;
      if (stop) add([PLACES[stop].x, PLACES[stop].y]);
      if (leg === "at-pickup" && from) add([PLACES[from].x, PLACES[from].y]);
      return boxAround(pts, 130, 190);
    }
    if (focus === "pickup" && from) return boxAround([[PLACES[from].x, PLACES[from].y]], 170, 300);
    if (main.length) pts.push(...main);
    if (car) add([car.x, car.y]);
    for (const r of tripRoutes) { if (selected && r.trip.id !== selected) continue; pts.push(...r.pts); }
    if (from && !main.length) add([PLACES[from].x, PLACES[from].y]);
    if (to && !main.length) add([PLACES[to].x, PLACES[to].y]);
    return pts.length ? boxAround(pts) : FULL_ISLAND;
  }, [focus, leg, main, tripRoutes, selected, from, to, car?.x, car?.y]);

  // fit the base box into the part of the element that is not covered by a sheet, bar or pill
  const target = useMemo<Box>(() => {
    const W = size.w || 390, H = size.h || 300;
    const i = { top: insets?.top ?? 0, right: insets?.right ?? 0, bottom: insets?.bottom ?? 0, left: insets?.left ?? 0 };
    const uw = Math.max(40, W - i.left - i.right);
    const uh = Math.max(40, H - i.top - i.bottom);
    const b = base;
    const k = Math.min(uw / Math.max(1, b.w), uh / Math.max(1, b.h)) * 1.45 ** z;
    const w = W / k, h = H / k;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    return { x: cx - (i.left + uw / 2) / k, y: cy - (i.top + uh / 2) / k, w, h };
  }, [base, size.w, size.h, z, insets?.top, insets?.right, insets?.bottom, insets?.left]);

  const vb = useEasedBox(target);
  const k = size.w > 0 ? size.w / vb.w : 0; // rendered px per view unit
  const u = (px: number) => (k > 0 ? px / k : px); // CSS px -> view units, so strokes and text keep their real size
  const showLabels = labels && size.w >= 240 && u(13) < vb.w * 0.075;
  const showChrome = size.w >= 260 && size.h >= 200;

  const tripLabels = useRef(new Set<string>()).current;
  // labels: pickup and drop-off first, then airports and towns, then sights; drop any that would collide
  const labelled = useMemo(() => {
    const rank = (id: PlaceId) => (id === from || id === to ? 0 : PLACES[id].kind === "airport" ? 1 : PLACES[id].kind === "town" ? 2 : 3);
    const gap = u(74); // keep roughly one label's width between them
    const taken: Pt[] = [];
    tripLabels.clear();
    const list = [...PLACE_IDS]
      .filter((id) => {
        const p = PLACES[id];
        return p.x > vb.x - 40 && p.x < vb.x + vb.w + 40 && p.y > vb.y - 30 && p.y < vb.y + vb.h + 30;
      })
      .sort((a, b) => rank(a) - rank(b))
      .map((id) => {
        const p = PLACES[id];
        const key = id === from || id === to;
        const clear = taken.every((t) => Math.hypot(t[0] - p.x, t[1] - p.y) > gap);
        const fits = p.x + u(13) * 0.58 * p.short.length + u(10) < vb.x + vb.w && p.y - u(9) > vb.y && p.y + u(9) < vb.y + vb.h;
        const show = showLabels && fits && (key || clear);
        if (show) taken.push([p.x, p.y]);
        return { id, show };
      });
    // the same rule for driver labels on the admin map, so names never pile up
    const order = [...tripRoutes].sort((a, b) => Number(b.trip.id === selected) - Number(a.trip.id === selected));
    for (const { trip, pts } of order) {
      if (!trip.label || !pts.length) continue;
      const at = pointAt(pts, trip.progress ?? 0);
      const clear = taken.every((t) => Math.hypot(t[0] - at.x, t[1] - at.y) > gap);
      if (clear || trip.id === selected) { taken.push([at.x, at.y]); tripLabels.add(trip.id); }
    }
    return list;
  }, [from, to, showLabels, vb.x, vb.y, vb.w, vb.h, k, tripRoutes, tripLabels, selected]);

  const scale = useMemo(() => {
    if (!showChrome || k <= 0) return null;
    for (const km of [1, 2, 5, 10, 20, 50]) {
      const units = km / unitsToKm(1);
      if (units * k >= 52 && units * k <= 130) return { km, px: units * k };
    }
    return null;
  }, [showChrome, k, vb.w]);

  if (renderer === "tiles" && tiles !== "off") return (
    <Suspense fallback={<div className={cn("h-full w-full bg-msea", className)} />}>
      {tiles === "ok"
        ? <TileMap from={from} to={to} progress={progress} leg={leg} focus={focus} insets={insets} trips={trips} showCar={showCar}
            selected={selected} onSelect={onSelect} zoom={zoom} caption={caption} className={className} ariaLabel={ariaLabel} marks={marks} fitAll={fitAll} labels={labels} />
        : <div className={cn("h-full w-full bg-msea", className)} />}
    </Suspense>
  );

  const label = ariaLabel ?? (from && to ? `Map of St. Lucia showing the route from ${PLACES[from].short} to ${PLACES[to].short}` : "Map of St. Lucia");

  return (
    <div ref={wrap} className={cn("relative h-full w-full overflow-hidden bg-msea", className)}>
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block h-full w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id="m-sea" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="var(--color-msea)" /><stop offset="100%" stopColor="var(--color-msea-2)" />
          </linearGradient>
          <linearGradient id="m-land" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="var(--color-land)" /><stop offset="100%" stopColor="var(--color-land-2)" />
          </linearGradient>
          <pattern id="m-relief" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <path d="M0 13H26" stroke="var(--color-relief)" strokeWidth="5" fill="none" />
          </pattern>
          <radialGradient id="m-hills" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#000" stopOpacity="1" /><stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
          <mask id="m-hillmask">
            <ellipse cx="300" cy="1075" rx="150" ry="190" fill="url(#m-hills)" />
            <ellipse cx="430" cy="760" rx="170" ry="200" fill="url(#m-hills)" />
            <ellipse cx="520" cy="430" rx="160" ry="170" fill="url(#m-hills)" />
          </mask>
        </defs>

        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#m-sea)" />

        {/* island */}
        <g>
          {ISLAND.map((d, i) => <path key={i} d={d} fill="url(#m-land)" stroke="var(--color-coast)" strokeWidth={u(1.2)} strokeLinejoin="round" />)}
          <g mask="url(#m-hillmask)">{ISLAND.map((d, i) => <path key={i} d={d} fill="url(#m-relief)" opacity=".5" />)}</g>
        </g>

        {/* roads: casing then fill */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {[ROADS.loop, ROADS.spur].map((d, i) => <path key={`c${i}`} d={d} stroke="var(--color-road-casing)" strokeWidth={u(6.5)} />)}
          {[ROADS.loop, ROADS.spur].map((d, i) => <path key={`f${i}`} d={d} stroke="var(--color-road)" strokeWidth={u(4)} />)}
        </g>

        {/* the trip route, drawn on top of the road it follows */}
        {main.length > 1 && focus !== "pickup" && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d={toPath(main)} stroke="var(--color-green)" strokeOpacity=".2" strokeWidth={u(11)} />
            <path d={toPath(main)} stroke="var(--color-green)" strokeWidth={u(4.5)} />
          </g>
        )}
        {tripRoutes.map(({ trip, pts }) => pts.length > 1 && (
          <path key={trip.id} d={toPath(pts)} fill="none" strokeLinecap="round" strokeWidth={u(selected === trip.id ? 5 : 3)}
            stroke={TONE[trip.tone ?? "green"]} strokeOpacity={selected && selected !== trip.id ? 0.35 : 0.9} />
        ))}

        {/* places, decluttered so labels never collide */}
        {labelled.map(({ id, show }) => {
          const p = PLACES[id];
          const key = id === from || id === to;
          return (
            <g key={id}>
              {!key && <circle cx={p.x} cy={p.y} r={u(3)} fill="var(--color-coast)" opacity={0.75} />}
              {show && (
                <text x={p.x + u(7)} y={p.y + u(4.5)} fontSize={u(13)} fontWeight={key ? 700 : 600}
                  fill="var(--color-map-ink)" stroke="var(--color-map-halo)" strokeWidth={u(3)} paintOrder="stroke" style={{ pointerEvents: "none" }}>
                  {p.short}
                </text>
              )}
            </g>
          );
        })}

        {/* pickup and drop-off */}
        {from && <Dot x={PLACES[from].x} y={PLACES[from].y} u={u} kind="from" />}
        {to && <Dot x={PLACES[to].x} y={PLACES[to].y} u={u} kind="to" />}

        {/* the car, pointing along the road */}
        {car && (
          <g style={{ transform: `translate(${car.x}px, ${car.y}px)`, transition: reduced() ? "none" : "transform .9s cubic-bezier(.4,0,.2,1)" }}>
            <circle r={u(13)} fill="var(--color-green)" opacity=".22" />
            <g style={{ transform: `rotate(${car.angle}deg)`, transition: reduced() ? "none" : "transform .9s ease" }}>
              <circle r={u(9)} fill="#fff" stroke="var(--color-green)" strokeWidth={u(2)} />
              <path d={`M0 ${-u(5)} L${u(3.6)} ${u(4)} L0 ${u(2)} L${-u(3.6)} ${u(4)} Z`} fill="var(--color-green)" />
            </g>
          </g>
        )}

        {/* one marker per live trip */}
        {tripRoutes.map(({ trip, pts }) => {
          if (!pts.length) return null;
          const at = pointAt(pts, trip.progress ?? 0);
          const on = selected === trip.id;
          return (
            <g key={trip.id} data-testid={`pin-${trip.id}`} onClick={() => onSelect?.(trip.id)} style={{ cursor: onSelect ? "pointer" : "default" }}>
              <circle cx={at.x} cy={at.y} r={u(16)} fill="transparent" />
              {on && <circle cx={at.x} cy={at.y} r={u(15)} fill={TONE[trip.tone ?? "green"]} opacity=".25" />}
              <g style={{ transform: `translate(${at.x}px, ${at.y}px) rotate(${at.angle}deg)` }}>
                <circle r={u(on ? 9.5 : 7.5)} fill="#fff" stroke={TONE[trip.tone ?? "green"]} strokeWidth={u(2)} />
                <path d={`M0 ${-u(4.4)} L${u(3)} ${u(3.4)} L0 ${u(1.6)} L${-u(3)} ${u(3.4)} Z`} fill={TONE[trip.tone ?? "green"]} />
              </g>
              {showLabels && trip.label && tripLabels.has(trip.id) && (
                <text x={at.x + u(13)} y={at.y - u(9)} fontSize={u(12.5)} fontWeight={700} fill="var(--color-map-ink)"
                  stroke="var(--color-map-halo)" strokeWidth={u(3)} paintOrder="stroke">{trip.label}</text>
              )}
            </g>
          );
        })}
      </svg>

      {/* chrome, in HTML so text size never depends on the view box */}
      {showChrome && (
        <>
          {caption && <span className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-paper/85 px-2 py-1 text-[12px] font-semibold text-mute">{caption}</span>}
          <span className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-paper/85 text-[12px] font-bold text-mute" aria-hidden>
            <Navigation size={13} className="mr-0.5" />N
          </span>
          {scale && (
            <span className="pointer-events-none absolute bottom-2 right-2 flex flex-col items-end gap-0.5" aria-hidden>
              <span className="text-[12px] font-semibold text-mute">{scale.km} km</span>
              <span className="block h-1.5 border-x-2 border-b-2 border-mute" style={{ width: scale.px }} />
            </span>
          )}
          {zoom && size.w >= 300 && (
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1">
              <button type="button" aria-label="Zoom in" onClick={() => setZ((v) => Math.min(4, v + 1))}
                className="tap flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2"><Plus size={18} /></button>
              <button type="button" aria-label="Zoom out" onClick={() => setZ((v) => Math.max(0, v - 1))}
                className="tap flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2"><Minus size={18} /></button>
              <button type="button" data-testid="button-recentre" aria-label="Recentre on the route" onClick={() => setZ(0)}
                className="tap mt-1 flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink shadow-e2 disabled:opacity-50" disabled={z === 0}><Crosshair size={17} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Dot({ x, y, u, kind }: { x: number; y: number; u: (n: number) => number; kind: "from" | "to" }) {
  if (kind === "from") return (
    <g><circle cx={x} cy={y} r={u(8)} fill="#fff" /><circle cx={x} cy={y} r={u(5.5)} fill="var(--color-green)" /></g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-u(7)} y={-u(7)} width={u(14)} height={u(14)} rx={u(3)} fill="#fff" />
      <rect x={-u(4.8)} y={-u(4.8)} width={u(9.6)} height={u(9.6)} rx={u(2)} fill="var(--color-orange)" />
    </g>
  );
}



/* ---------------- Leaflet renderer (real OSM tiles), loaded only when tiles work ---------------- */

const TileMap = lazy(() => import("./tile-map"));
/** One known tile; if it loads, the pack is there. Remembered for the session. */
const PROBE_TILE = "./map/tiles/10/338/471.png";
let tilesProbe: "ok" | "off" | undefined;
