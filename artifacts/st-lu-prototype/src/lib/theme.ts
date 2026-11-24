import { useEffect, useState } from "react";

/**
 * One design system, two themes. The preference is Light / Dark / System and is remembered in
 * localStorage["stlu-theme"]. With no stored choice the app follows the device (prefers-color-scheme).
 * The resolved theme is a `dark` class on <html>; every colour is a token that the class swaps.
 */
const KEY = "stlu-theme";
export type ThemePref = "light" | "dark" | "system";
export type Theme = "light" | "dark";

let forcedLight = false; // admin is light-only for now
const mq = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null);

export function readPref(): ThemePref {
  try { const v = localStorage.getItem(KEY); if (v === "dark" || v === "light" || v === "system") return v; } catch { /* storage blocked */ }
  return "system";
}
export const resolve = (p: ThemePref): Theme => (p === "system" ? (mq()?.matches ? "dark" : "light") : p);
function paint() {
  const dark = !forcedLight && resolve(readPref()) === "dark";
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#06120D" : "#FAF6EE");
  window.dispatchEvent(new Event("stlu-theme"));
}
export function setThemePref(p: ThemePref) {
  try { localStorage.setItem(KEY, p); } catch { /* storage blocked */ }
  paint();
}
/** Kept for older callers: sets an explicit light or dark choice. */
export const applyTheme = (t: Theme) => setThemePref(t);
export function forceLight(on: boolean) { forcedLight = on; paint(); }
export function initTheme() {
  paint();
  const m = mq();
  const onChange = () => { if (readPref() === "system") paint(); };
  if (m?.addEventListener) m.addEventListener("change", onChange); else m?.addListener?.(onChange); // old Safari
}
export function useTheme() {
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); window.addEventListener("stlu-theme", f); return () => window.removeEventListener("stlu-theme", f); }, []);
  const pref = readPref();
  const theme: Theme = typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
  return { theme, pref, setPref: setThemePref, toggle: () => setThemePref(theme === "dark" ? "light" : "dark") };
}
