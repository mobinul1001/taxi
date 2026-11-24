import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { extActions, useAppState } from "@/lib/store";
import { time } from "@/lib/format";

/** Page 12: in-app reminder that slides in from the top on every /app/driver/* page. */
export function DriverReminderBanner() {
  const s = useAppState();
  const loc = useLocation();
  const nav = useNavigate();
  const r = s.ext.reminder;
  if (!r || s.ext.dismissed.includes(r.id) || !loc.pathname.startsWith("/app/driver")) return null;
  const b = s.bookings.find((x) => x.ref === r.ref);
  if (!b) return null;
  return (
    <div className="absolute inset-x-0 top-0 z-[55] px-3 pt-11" data-testid="banner-reminder">
      <div className="anim-banner rounded-xl bg-orange p-4 text-orange-ink shadow-[0_18px_40px_-16px_rgba(20,32,26,.55)]">
        <p className="flex items-center gap-2 font-display text-[17px] font-bold"><Clock size={20} />Pickup in 1 hour 30 minutes</p>
        <p className="mt-1 text-[14px]">{b.passenger} · {b.from} · {time(b.pickup)}{b.flight ? ` · Flight ${b.flight}` : ""}</p>
        <div className="mt-3 flex gap-2">
          <button data-testid="button-reminder-view" onClick={() => { extActions.dismissReminder(r.id); nav(`/app/driver/trips/${b.ref}`); }} className="min-h-12 rounded-md bg-ink px-4 text-[14px] font-semibold text-white">View trip</button>
          <button data-testid="button-reminder-dismiss" onClick={() => extActions.dismissReminder(r.id)} className="min-h-12 rounded-md px-4 text-[14px] font-semibold">Dismiss</button>
        </div>
      </div>
    </div>
  );
}
