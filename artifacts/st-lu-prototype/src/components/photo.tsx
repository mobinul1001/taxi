import type { CSSProperties } from "react";
import { media, type Scrim, type Slot } from "@/assets/media";
import { cn } from "@/lib/utils";

/**
 * Responsive photo from the media registry: AVIF, then WebP, then JPEG; intrinsic size set (no layout shift);
 * blurred placeholder while loading; lazy below the fold. `fill` covers the nearest positioned parent.
 */
/**
 * `tag`: a small "Sample imagery" chip, off unless asked for. The chip used to sit on every people photo,
 * which read as a defect on a client-facing card. Disclosure now lives in one line per screen instead
 * (landing footer, home note, driver screens' SampleNote), which is honest and does not deface the art.
 */
export function Photo({ slot, sizes = "100vw", priority = false, fill = false, className, alt, pos, scrim, style, tag, tagClass }: {
  slot: Slot; sizes?: string; priority?: boolean; fill?: boolean; className?: string; alt?: string; pos?: string; scrim?: Scrim; style?: CSSProperties; tag?: boolean; tagClass?: string;
}) {
  const m = media(slot);
  const s = scrim ?? "none";
  return (
    <>
      <picture className="contents">
        <source type="image/avif" srcSet={m.avif} sizes={sizes} />
        <source type="image/webp" srcSet={m.webp} sizes={sizes} />
        <img src={m.jpg} width={m.w} height={m.h} alt={alt ?? m.alt} loading={priority ? "eager" : "lazy"} decoding={priority ? "sync" : "async"}
          {...(priority ? { fetchpriority: "high" } as Record<string, string> : {})}
          className={cn("photo block h-full w-full object-cover", fill && "absolute inset-0", className)}
          style={{ objectPosition: pos ?? m.pos ?? "50% 50%", backgroundColor: m.color, backgroundImage: `url(${m.blur})`, backgroundSize: "cover", backgroundPosition: "center", ...style }} />
      </picture>
      {s !== "none" && <span aria-hidden className={cn("pointer-events-none absolute inset-0", `scrim-${s}`)} />}
      {tag === true && <SampleTag className={tagClass ?? "left-2 top-2"} />}
    </>
  );
}

/** Small honest label for AI-generated stand-in imagery. */
export function SampleTag({ className, children = "Sample imagery" }: { className?: string; children?: string }) {
  return <span className={cn("pointer-events-none absolute z-[1] rounded-full bg-black/55 px-2 py-[3px] text-[12px] font-semibold leading-none text-white", className)}>{children}</span>;
}

/** One honest line for a screen that shows driver portraits: they are AI-generated stand-ins. */
export function SampleNote({ className }: { className?: string }) {
  return <p className={cn("text-[12px] text-mute", className)}>Driver photos are AI-generated sample imagery.</p>;
}

/** Round portrait from the pack (tight face crop: no uniform, badge or vehicle text in frame). */
export function Face({ slot, size = 44, className, ring = false }: { slot: Slot; size?: number; className?: string; ring?: boolean }) {
  return (
    <span style={{ width: size, height: size }} className={cn("relative inline-block shrink-0 overflow-hidden rounded-full bg-neutral", ring && "ring-2 ring-white/80", className)}>
      <Photo slot={slot} sizes={`${size * 2}px`} tag={false} />
    </span>
  );
}
