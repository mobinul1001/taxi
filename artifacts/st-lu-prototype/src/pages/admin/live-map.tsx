import { useMemo, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { Btn, Card, Empty, StatusPill } from "@/components/kit";
import { MapView, type MapTrip } from "@/components/map";
import { placeFrom } from "@/lib/geo";
import { useOpenBooking } from "@/components/admin-shell";
import { useAppState } from "@/lib/store";
import { ACTIVE, routeShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";


export function LiveMap() {
  const s = useAppState();
  const open = useOpenBooking();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const active = useMemo(() => s.bookings.filter((b) => ACTIVE.includes(b.status)), [s]);
  const list = active.filter((b) => filter === "all" || b.status === filter);
  const [pick, setPick] = useState<string | null>(null);
  // nothing is selected until the dispatcher picks a trip: the map stays on the whole island
  const sel = pick ? list.find((b) => b.ref === pick) : undefined;
  const d = s.drivers.find((x) => x.id === sel?.driverId);
  const count = (st: Status) => active.filter((b) => b.status === st).length;
  // every active trip sits on its real route, at the point its status implies
  const pins: MapTrip[] = list.map((b) => ({
    id: b.ref,
    from: placeFrom(b.from),
    to: placeFrom(b.to),
    progress: b.status === "on_the_way" ? 0.18 : b.status === "at_pickup" ? 0 : b.heading ? 0.72 : 0.3,
    tone: b.status === "on_the_way" ? "green" : b.status === "at_pickup" ? "orange" : "blue",
    label: s.drivers.find((x) => x.id === b.driverId)?.name.split(" ")[0],
  }));
  const chips: [typeof filter, string, string][] = [["all", `All ${active.length}`, "bg-neutral"], ["on_the_way", `On the way ${count("on_the_way")}`, "bg-ok text-green"], ["at_pickup", `At pickup ${count("at_pickup")}`, "bg-warn text-warn-ink"], ["onboard", `Onboard ${count("onboard")}`, "bg-info text-info-ink"]];
  return (
    <div>
      {/* phone: an even 2x2 grid, every chip the same size and whole. tablet and up: one row. */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {chips.map(([k, l, c]) => <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} className={cn("tap flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-full px-3 text-[13px] font-semibold sm:w-auto sm:px-4", c, filter === k && "ring-2 ring-green ring-offset-2 ring-offset-ground")}>{l}</button>)}
        <span className="ml-auto hidden whitespace-nowrap text-[14px] text-mute sm:inline">Updated just now</span>
      </div>
      <p className="mt-1.5 text-[13px] text-mute sm:hidden">Updated just now</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="min-w-0">
          {sel && (
            <div className="anim-pop mb-3 rounded-2xl border border-line bg-paper p-4 shadow-e2">
              <div className="flex items-center justify-between gap-2"><b>{sel.passenger} · {sel.service}</b><StatusPill status={sel.status} /></div>
              <p className="text-[13px] text-mute">Driver {d?.name} · {d?.vehicle} · {d?.plate}</p>
              <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-[13px]"><dt className="whitespace-nowrap text-mute">ETA pickup</dt><dd className="font-bold">{sel.status === "on_the_way" ? "6 min" : sel.status === "at_pickup" ? "Arrived" : "Picked up"}</dd><dt className="whitespace-nowrap text-mute">Route</dt><dd className="font-bold">{sel.from.split(" (")[0]} to {sel.to}</dd></dl>
              <Btn size="sm" variant="soft" className="mt-3" onClick={() => open(sel.ref)}>Open booking</Btn>
            </div>
          )}

        <div className="flex flex-col gap-2.5">
          {list.map((b) => {
            const dr = s.drivers.find((x) => x.id === b.driverId);
            return (
              <button key={b.ref} data-testid={`live-${b.ref}`} onClick={() => setPick(b.ref)} className={cn("rounded-2xl border bg-paper p-3.5 text-left", sel?.ref === b.ref ? "border-2 border-green" : "border-line")}>
                <div className="flex items-center justify-between"><b className="text-[15px]">{b.passenger}</b><StatusPill status={b.status} label={b.heading ? "Heading to destination" : undefined} /></div>
                <p className="text-[13px] text-mute">{b.to === "Island loop" ? "Island loop" : routeShort(b)} · {dr?.name}</p>
              </button>
            );
          })}
          {list.length === 0 && <Card><Empty icon={<MapIcon />} title="No active trips" body="Trips show here once a driver taps On my way." /></Card>}
        </div>
        </div>
        <div className="relative h-[clamp(430px,calc(100vh-220px),900px)] overflow-hidden rounded-2xl border border-line">
          <MapView trips={pins} selected={sel?.ref} onSelect={setPick} focus={sel ? "trip" : "island"} zoom labels insets={{ top: 16, right: 64, bottom: 16, left: 16 }}
            ariaLabel={`Live map of St. Lucia with ${pins.length} active ${pins.length === 1 ? "trip" : "trips"}`} />

        </div>
      </div>
    </div>
  );
}
