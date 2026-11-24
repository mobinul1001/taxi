import { Ban, BadgeDollarSign, CalendarClock, ClipboardList, Compass, Flag, Globe2, Hammer, KeyRound, Layers, Lightbulb, ListChecks, MonitorPlay, MonitorSmartphone, Palette, PenTool, Plug, Rocket, Route, Send, ShieldCheck, Smartphone, Target, UserMinus, UserX, Wrench, XCircle, Building2 } from "lucide-react";
import type { ComponentType } from "react";

type I = ComponentType<{ size?: number }>;
/** Icon sets for list sections, matched by position to the arrays in each page. Decorative only. */
export const SET: Record<string, I[]> = {
  devSteps: [Compass, PenTool, Smartphone, Plug, ShieldCheck, Rocket],
  exc: [UserX, XCircle, UserMinus],
  drivers: [Layers, Smartphone, ListChecks, Plug, Route, Globe2, Palette, MonitorSmartphone],
  stages: [Compass, PenTool, Hammer, ShieldCheck, Rocket],
  way: [ClipboardList, BadgeDollarSign, MonitorPlay, KeyRound],
  expect: [Send, CalendarClock, MonitorPlay, Flag],
  story: [Target, Lightbulb, Compass],
  addons: [Rocket, Building2, Globe2, Plug, Wrench],
};
export function Ic({ set, i, size = 22 }: { set: keyof typeof SET; i: number; size?: number }) {
  const C = SET[set][i] ?? Compass;
  return <span className="xic" aria-hidden><C size={size} /></span>;
}
