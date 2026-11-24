import { Photo } from "@/components/photo";
import type { Slot } from "@/assets/media";

/**
 * Imagery is photography only. The old illustrated scenes (HeroScene, Scene, CarArt) are gone;
 * `Media` keeps the old "scene kind" API for existing screens and maps each kind to a photo slot.
 */
export type SceneKind = "pitons" | "bay" | "marigot" | "forest" | "road";
const KIND_TO_SLOT: Record<SceneKind, Slot> = { pitons: "dest-pitons-dusk", bay: "dest-rodney-bay", marigot: "dest-marigot", forest: "svc-fullday", road: "svc-roundtrip" };

export function Media({ kind = "pitons", slot, alt = "", className, sizes = "(min-width: 768px) 33vw, 50vw", tagClass }: { kind?: SceneKind; slot?: Slot; alt?: string; className?: string; sizes?: string; tagClass?: string }) {
  return <Photo slot={slot ?? KIND_TO_SLOT[kind]} alt={alt} className={className} sizes={sizes} tagClass={tagClass} />;
}
