import type { Ext } from "./types";

export const defaultExt = (): Ext => ({
  delayed: false,
  jobUpdates: {},
  reminder: null,
  dismissed: [],
  renewals: {},
  cards: [],
  changes: { "SLU-48318": { oldTime: "08:30", oldPax: 2 } },
});

/** Masked label only, e.g. "Visa 4242". Never keep the full number. */
export const cardLabel = (no: string) => {
  const d = no.replace(/\D/g, "");
  const brand = d.startsWith("4") ? "Visa" : d.startsWith("5") || d.startsWith("2") ? "Mastercard" : d.startsWith("3") ? "Amex" : "Card";
  return `${brand} ${d.slice(-4)}`;
};
export const DECLINE_CARD = "4000000000000002";
