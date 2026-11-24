import type { ReactNode } from "react";
import { CircleCheck, MessageCircle, Minus, Navigation, Phone, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function RouteBlock({ from, to, fromLabel, toLabel, dark = false, className }: { from: string; to: string; fromLabel?: string; toLabel?: string; dark?: boolean; className?: string }) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center pb-1 pt-[5px]" aria-hidden>
        <span className={cn("h-3 w-3 rounded-full border-[3px]", dark ? "border-white" : "border-green")} />
        <span className={cn("my-1 w-px flex-1 border-l-2 border-dotted", dark ? "border-white/50" : "border-line-strong")} />
        <span className="h-3 w-3 rounded-[3px] bg-orange" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="min-w-0">
          {fromLabel && <p className={cn("text-[12.5px] font-medium", dark ? "text-white/75" : "text-mute")}>{fromLabel}</p>}
          <p className={cn("text-[15.5px] font-semibold leading-snug", dark && "text-white")}>{from}</p>
        </div>
        <div className="min-w-0">
          {toLabel && <p className={cn("text-[12.5px] font-medium", dark ? "text-white/75" : "text-mute")}>{toLabel}</p>}
          <p className={cn("text-[15.5px] font-semibold leading-snug", dark && "text-white")}>{to}</p>
        </div>
      </div>
    </div>
  );
}

export function Row({ label, value, strong, className }: { label: ReactNode; value: ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-line py-2.5 text-[15px] last:border-0", className)}>
      <span className="text-mute">{label}</span>
      <span className={cn("min-w-0 text-right text-ink", strong ? "font-bold" : "font-semibold")}>{value}</span>
    </div>
  );
}

const contactCls = "tap inline-flex whitespace-nowrap min-h-12 min-w-0 items-center justify-center gap-2 rounded-lg border border-line-strong bg-paper px-3 text-[15px] font-semibold text-ink shadow-e1 hover:border-green/60";
export function ContactButtons({ phone, maps, mapsLabel = "Navigate" }: { phone: string; maps?: string; mapsLabel?: string }) {
  const tel = phone.replace(/[^\d+]/g, "");
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <a href={`tel:${tel}`} data-testid="button-call" className={contactCls}><Phone size={18} className="shrink-0 text-green" /> Call</a>
      {maps ? (
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps + ", St Lucia")}`} target="_blank" rel="noreferrer" className={contactCls}><Navigation size={17} className="shrink-0 text-green" />{mapsLabel}</a>
      ) : (
        <a href={`https://wa.me/${tel.replace("+", "")}`} target="_blank" rel="noreferrer" data-testid="button-whatsapp" className={contactCls}><MessageCircle size={18} className="shrink-0 text-green" /> WhatsApp</a>
      )}
    </div>
  );
}

/** Bottom sheet that lives inside the phone frame. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="anim-fade absolute inset-0 z-50 flex items-end bg-green-night/55" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="anim-sheet no-scrollbar max-h-[90%] w-full overflow-y-auto rounded-t-3xl bg-ground px-5 pb-7 pt-3 shadow-float">
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong" />
        <h2 className="mb-4 font-display text-[22px] font-bold leading-tight">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function NotifiedBanner({ text = "Passenger and dispatcher notified by SMS and WhatsApp" }: { text?: string }) {
  return (
    <div className="anim-rise flex items-start gap-2.5 rounded-lg bg-ok px-4 py-3 text-[14px] font-medium text-green">
      <CircleCheck size={18} className="mt-px shrink-0" />
      <span>{text}</span>
    </div>
  );
}

export function Counter({ value, onChange, min = 1, max = 12 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const b = "tap relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-paper text-ink shadow-e1 after:absolute after:-inset-1 after:content-[''] hover:border-green/60 disabled:pointer-events-none disabled:opacity-40";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={b} aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}><Minus size={16} /></button>
      <span className="tnum w-7 text-center font-display text-[18px] font-bold" aria-live="polite">{value}</span>
      <button type="button" className={b} aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}><Plus size={16} /></button>
    </div>
  );
}
