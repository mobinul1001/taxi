/**
 * Blog cover pictures: original illustrations drawn for each guide (no stock photos, no real people), saved as WebP in
 * ./img. "sm" is 600 px wide for cards, the large one 1200 px for the featured post and the article header.
 */
const FILES = import.meta.glob<string>("./img/blog-*.webp", { eager: true, query: "?url", import: "default" });
const url = (slug: string, sm: boolean) => FILES[`./img/blog-${slug}${sm ? "-sm" : ""}.webp`];

export function Cover({ slug, size = "sm", eager = false, className }: { slug: string; size?: "sm" | "lg"; eager?: boolean; className?: string }) {
  const src = url(slug, size === "sm");
  if (!src) return null;
  const sm = size === "sm";
  return <img className={`cover ${className ?? ""}`} src={src} width={sm ? 600 : 1200} height={sm ? 315 : 630} alt="" aria-hidden loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />;
}

const ILL = import.meta.glob<string>("./img/ill-*.webp", { eager: true, query: "?url", import: "default" });

/** A section illustration (original artwork, decorative), shown beside a section heading. */
export function Illus({ name }: { name: string }) {
  const src = ILL[`./img/ill-${name}.webp`];
  if (!src) return null;
  return <img className="ill" src={src} width={960} height={540} alt="" aria-hidden loading="lazy" decoding="async" />;
}
