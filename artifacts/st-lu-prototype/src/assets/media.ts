/**
 * Media registry: every photo in the product is a named slot.
 * Files live in src/assets/photos (built from photo-source/ by scripts/build-photos.py as AVIF + WebP + JPEG).
 * To swap a photo: replace the file in photo-source/ with the same name, run the script, rebuild.
 *
 * All 35 photos are AI-generated SAMPLE imagery. People are stand-ins, never real staff or guests.
 * Crops below follow the pack's MANIFEST: third-party resort signs and the wrong company name on
 * uniforms / doors are kept out of frame (`face-*` and `guest-*` are pre-cropped squares).
 */
import { GEN } from "./media.gen";

const files = import.meta.glob("./photos/*", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const url = (name: string, w: number, ext: string) => files[`./photos/${name}-${w}.${ext}`];

export type Slot = keyof typeof GEN;
export type Scrim = "none" | "bottom" | "top" | "left" | "full";
type Meta = { alt: string; pos?: string; scrim?: Scrim; people?: boolean; note?: string };

export const MEDIA: Record<Slot, Meta> = {
  "welcome-portrait": { alt: "Coast road winding toward the Pitons at sunset", pos: "50% 30%", scrim: "bottom", note: "768px wide: needs a 2x version for tablet full-bleed" },
  "hero-landing": { alt: "Taxi on the coast road with the Pitons across the bay", pos: "60% 55%", scrim: "left", note: "1376px wide: needs a 2x version for 1920+ screens" },
  "hero-app-home": { alt: "Sailboats in a calm bay at sunrise", pos: "50% 60%", scrim: "top" },
  "og-share": { alt: "The Pitons above the coast road at golden hour", pos: "50% 50%" },
  "svc-airport": { alt: "Driver greeting arriving guests outside the airport", pos: "72% 40%", people: true, note: "sign text is garbled: small tiles only, cropped right" },
  "svc-private-tour": { alt: "Tour van at a viewpoint over the Pitons", pos: "30% 40%", note: "van logo garbled: keep the van out of the crop" },
  "svc-fullday": { alt: "Guests walking to a rainforest waterfall", pos: "50% 50%", people: true },
  "svc-roundtrip": { alt: "Car on a coastal road at dusk", pos: "50% 60%" },
  "svc-chauffeur": { alt: "Chauffeur opening the door of an executive car", pos: "30% 55%", people: true, note: "resort sign on the right: crop left" },
  "svc-delivery": { alt: "Courier handing over a parcel at a villa gate", pos: "50% 40%", people: true, note: "logo and label garbled: small tiles only" },
  "dest-pitons-dusk": { alt: "The Pitons at dusk", pos: "50% 55%", scrim: "bottom" },
  "dest-marigot": { alt: "Yachts at anchor in Marigot Bay", pos: "50% 50%", scrim: "bottom" },
  "dest-rodney-bay": { alt: "Sunset over the beach at Rodney Bay", pos: "50% 60%", scrim: "bottom" },
  "dest-castries": { alt: "Colourful harbour front of Castries", pos: "50% 55%", scrim: "bottom" },
  "dest-soufriere": { alt: "Fishing boats in Soufriere bay below the Pitons", pos: "45% 50%", scrim: "bottom" },
  "dest-airport-uvf": { alt: "Small aircraft on the apron with the Pitons behind", pos: "55% 50%", scrim: "bottom" },
  "fleet-suv": { alt: "White SUV taxi on a palm-lined road", pos: "50% 62%" },
  "fleet-minivan": { alt: "Dark minivan on a coastal road", pos: "55% 60%" },
  "fleet-sedan": { alt: "Executive sedan at a hotel entrance in the evening", pos: "88% 62%", people: true, note: "resort sign on the left edge: crop it out" },
  "fleet-interior": { alt: "Leather interior of an executive car with a sea view", pos: "50% 50%" },
  "driver-1": { alt: "Driver standing beside a taxi", people: true }, "driver-2": { alt: "Driver in a blazer", people: true },
  "driver-3": { alt: "Driver beside a minivan", people: true }, "driver-4": { alt: "Driver leaning on a taxi", people: true },
  "driver-5": { alt: "Driver with a name sign in the arrivals hall", people: true }, "driver-6": { alt: "Driver at the wheel", people: true, note: "never full frame: door text" },
  "pax-couple": { alt: "Couple arriving by taxi", people: true }, "pax-family": { alt: "Family arriving by taxi", people: true },
  "pax-business": { alt: "Business traveller arriving at a hotel", people: true }, "pax-solo": { alt: "Traveller checking her phone beside a taxi", people: true },
  "driver-app-hero": { alt: "View from the driver's seat along the coast", pos: "60% 40%", scrim: "full", people: true },
  "empty-trips": { alt: "Empty coast road with a palm at sunrise", pos: "50% 50%" },
  "admin-login": { alt: "Castries harbour lights at night", pos: "50% 60%", scrim: "full", note: "1376px wide: needs a 2x version for 1920+ screens" },
  "support-team": { alt: "Dispatch team at their desk", pos: "50% 45%", people: true, note: "wall map and shirts show another company name: use small or cropped" },
  "extra-taxi-pitons": { alt: "Taxi on the coast road below the Pitons", pos: "50% 60%", scrim: "bottom" },
  "face-1": { alt: "Portrait, sample imagery", people: true }, "face-2": { alt: "Portrait, sample imagery", people: true }, "face-3": { alt: "Portrait, sample imagery", people: true },
  "face-4": { alt: "Portrait, sample imagery", people: true }, "face-5": { alt: "Portrait, sample imagery", people: true }, "face-6": { alt: "Portrait, sample imagery", people: true },
  "guest-couple": { alt: "Guests laughing beside a taxi, sample imagery", people: true }, "guest-family": { alt: "Guests arriving, sample imagery", people: true },
  "guest-solo": { alt: "Guest portrait, sample imagery", people: true }, "guest-business": { alt: "Guest arriving at a hotel, sample imagery", people: true },
};

export function media(slot: Slot) {
  const g = GEN[slot], m = MEDIA[slot];
  const set = (ext: string) => g.sizes.map((w) => `${url(slot, w, ext)} ${w}w`).join(", ");
  const largest = g.sizes[g.sizes.length - 1];
  return { ...m, w: g.w, h: g.h, blur: g.blur, color: g.color, avif: set("avif"), webp: set("webp"), jpg: url(slot, largest, "jpg") };
}

/** Portrait slot for a driver id (stable mapping so the same driver always gets the same sample face). */
export function driverFace(id: string | undefined): Slot {
  const n = parseInt((id ?? "").replace(/\D/g, "") || "1", 10);
  return (`face-${((n - 1) % 6) + 1}`) as Slot;
}
