import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A frame of the guided demo.
 *
 * The screen inside is laid out at a FIXED design size and the whole box is scaled down with a CSS
 * transform to fit its column, so a frame is never cropped and never scrolls. Two things keep the
 * text readable and the content whole:
 *  - the design height follows the room the stage actually has, so the scale stays near 1 (base text
 *    is 13px, so it lands at or above 12px on screen);
 *  - if the screen still needs more height than the frame has, rows marked data-trim are dropped,
 *    level by level, until it fits. Content is trimmed, never cut off.
 */
export const DESIGN_W = { phone: 360, tablet: 680, tabletSm: 560, feed: 300 } as const;
const MAX_H = 620;
const MIN_H = 300;
const MIN_W = 280;
const MAX_LEVEL = 3;

export interface FrameSize { w: number; h: number; k: number; level: number; compact: boolean }

export function useFrameSize(kind: keyof typeof DESIGN_W, el: HTMLElement | null): Omit<FrameSize, "level"> {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [el]);
  const full = DESIGN_W[kind];
  const bw = box.w || full;
  const bh = box.h || MAX_H;
  // A column too narrow to hold the design width at a readable scale lays the screen out at the width
  // it actually has instead of scaling it down: the text stays at its own size and nothing is cropped.
  // A frame is never scaled: scaling is what pushed 13px text down to 8px on a short landscape window. A column
  // narrower than the design width lays the screen out at the width it has; a stage shorter than the frame
  // scrolls, with its controls staying put. Text stays at its own size everywhere.
  const dw = bw < full ? Math.max(MIN_W, Math.floor(bw)) : full;
  const h = Math.max(MIN_H, Math.min(MAX_H, Math.floor(bh)));
  return { w: dw, h, k: 1, compact: h < 540 };
}

export function Frame({ label, kind = "phone", pulse, children }: {
  label: string; kind?: keyof typeof DESIGN_W; pulse: boolean; children: (size: FrameSize) => ReactNode;
}) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const size = useFrameSize(kind, el);
  const phone = kind === "phone";
  // the starting guess, so most frames settle without a second pass
  // start as full as the height plausibly allows; the measure below trims only if it really must,
  // which keeps a tall frame from being trimmed into a half-empty one
  const start = size.h >= 500 ? 0 : size.h >= 430 ? 1 : size.h >= 370 ? 2 : 3;
  const [level, setLevel] = useState(start);

  useEffect(() => { setLevel(start); }, [start, size.w, size.h, kind]);

  // After every render: if the screen is taller than its box, drop one more level. It only ever goes
  // down, so a frame settles instead of flickering between two versions of the same screen.
  useLayoutEffect(() => {
    const host = screen.current?.querySelector<HTMLElement>("[data-frame-screen]");
    if (!host) return;
    if (host.scrollHeight > host.clientHeight + 1 && level < MAX_LEVEL) setLevel((l) => Math.min(MAX_LEVEL, l + 1));
  });

  const full: FrameSize = { ...size, level };

  return (
    <section aria-label={label} data-pulse={pulse || undefined} // columns share the width in proportion to their design width, so every frame scales the same
      className="demo-frame flex min-h-0 min-w-0 basis-0 flex-col items-center" style={{ maxWidth: DESIGN_W[kind], flexGrow: DESIGN_W[kind] }}>
      <p className="mb-1.5 shrink-0 text-center text-[12px] font-bold uppercase tracking-[.12em] text-mute">{label}</p>
      <div ref={setEl} className="flex min-h-0 w-full flex-1 items-start justify-center">
        {/* the outer box takes the scaled size, so the frame never overflows its column */}
        <div data-frame-box style={{ width: size.w * size.k, height: size.h * size.k }}>
          <div ref={screen} data-level={level}
            className={cn("demo-screen relative overflow-hidden bg-ground", phone
              ? "rounded-[26px] border-[7px] border-[#0C1611] shadow-e3 dark:border-[#07130E]"
              : "rounded-xl border border-line shadow-e2")}
            style={{ width: size.w, height: size.h, transform: `scale(${size.k})`, transformOrigin: "top left" }}
          >
            {children(full)}
          </div>
        </div>
      </div>
    </section>
  );
}
