import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, MessageSquare, Pause, Play, RotateCcw, Smartphone } from "lucide-react";
import { LogoMark, ThemeButton } from "@/components/kit";
import { cn } from "@/lib/utils";
import { AdminFrame, DriverFrame, PassengerFrame } from "./frames";
import { Frame } from "./frame-box";
import { SCENARIOS, scenarioOf, type FrameKey, type ScenarioId } from "./script";

function useMedia(query: string) {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const h = () => setOn(m.matches);
    h(); m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, [query]);
  return on;
}

export default function GuidedDemo() {
  // ?scenario=cancel&step=4&play=0 opens the demo at an exact point (used for review links and screenshots)
  const [params] = useSearchParams();
  const startScenario = (SCENARIOS.find((x) => x.id === params.get("scenario"))?.id ?? "trip") as ScenarioId;
  const startStep = Math.max(0, (Number(params.get("step")) || 1) - 1);
  const autoStart = params.get("play") !== "0";
  const [sid, setSid] = useState<ScenarioId>(startScenario);
  const scenario = scenarioOf(sid);
  const steps = scenario.steps;
  const [i, setI] = useState(() => Math.min(startStep, scenarioOf(startScenario).steps.length - 1));
  const [speed, setSpeed] = useState(1);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const wide = useMedia("(min-width: 1440px)");
  const split = useMedia("(min-width: 1024px)");
  // under 640px ten segments would be narrower than a finger: show progress only, the step list still jumps
  const stripClickable = useMedia("(min-width: 640px)");
  const [playing, setPlaying] = useState(autoStart);
  const [tab, setTab] = useState<FrameKey>("passenger");
  const live = useRef<HTMLParagraphElement>(null);

  const step = steps[Math.min(i, steps.length - 1)];
  const s = step.s;
  const last = i >= steps.length - 1;
  const driverOn = s.drv !== "off";

  const go = useCallback((n: number) => { setI(Math.max(0, Math.min(steps.length - 1, n))); }, [steps.length]);
  const restart = () => { setI(0); setPlaying(!reduced); };
  const pick = (id: ScenarioId) => { setSid(id); setI(0); setTab("passenger"); setPlaying(!reduced); };

  useEffect(() => { if (reduced) setPlaying(false); }, [reduced]);
  useEffect(() => {
    if (!playing || reduced || last) return;
    const t = window.setTimeout(() => setI((n) => Math.min(steps.length - 1, n + 1)), 6500 / speed);
    return () => window.clearTimeout(t);
  }, [playing, reduced, last, i, speed, steps.length]);
  useEffect(() => { if (last) setPlaying(false); }, [last]);
  // follow the actor on small screens so the tap is always visible
  useEffect(() => { if (!split && step.actor) setTab(step.actor); }, [split, step.actor, i]);

  const frames = {
    passenger: (
      <Frame key="p" label="Passenger" pulse={step.pulse.includes("passenger")}>
        {(f) => <PassengerFrame s={s} level={f.level} tap={step.actor === "passenger" ? step.tap : undefined} />}
      </Frame>
    ),
    driver: (
      <Frame key="d" label="Driver" pulse={step.pulse.includes("driver")}>
        {(f) => <DriverFrame s={s} level={f.level} tap={step.actor === "driver" ? step.tap : undefined} />}
      </Frame>
    ),
    admin: (feed: boolean) => (
      <Frame key="a" label="Admin" kind={feed ? "feed" : wide ? "tablet" : "tabletSm"} pulse={step.pulse.includes("admin")}>
        {(f) => <AdminFrame s={s} feed={feed} level={f.level} tap={step.actor === "admin" ? step.tap : undefined} />}
      </Frame>
    ),
  };

  const stage = !split ? (
    <div className="no-scrollbar flex min-h-0 w-full flex-1 justify-center overflow-y-auto">
      {tab === "passenger" ? frames.passenger : tab === "driver" ? frames.driver : frames.admin(false)}
    </div>
  ) : (
    <div className="no-scrollbar flex min-h-0 w-full flex-1 items-stretch justify-center gap-3 overflow-y-auto xl:gap-5">
      {frames.passenger}
      {wide ? <>{frames.admin(false)}{driverOn && frames.driver}</> : <>{driverOn && frames.driver}{frames.admin(driverOn)}</>}
    </div>
  );

  const narrator = (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-green">Step {step.n} of {steps.length}</p>
      <p className="t-title mt-0.5 text-[16px] sm:text-[17px]" data-testid="text-demo-title">{step.title}</p>
      <p ref={live} aria-live="polite" className="mt-0.5 max-w-[92ch] text-[13px] leading-snug text-mute sm:mt-1 sm:leading-relaxed">{step.say}</p>
    </div>
  );

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-aground">
      <header className="shrink-0 border-b border-line bg-paper">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-1.5 sm:gap-x-4 sm:px-6 xl:py-2.5 [@media(max-height:700px)]:py-1">
          <Link to="/" aria-label="Start page" className="tap inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 text-[13px] font-semibold hover:border-green/60"><ArrowLeft size={15} /><span className="min-[420px]:hidden">Start</span><span className="max-[419px]:hidden">Start page</span></Link>
          <span className="hidden items-center gap-2 sm:inline-flex"><LogoMark size={30} /><span className="font-serif text-[18px] font-semibold tracking-[-0.02em]">St Lu</span></span>
          <h1 className="t-title shrink-0 text-[16px] sm:text-[19px]">Guided demo</h1>
          <div className="flex min-w-0 items-center gap-2 max-[419px]:order-last max-[419px]:basis-full min-[420px]:ml-auto">
            <select aria-label="Scenario" data-testid="select-scenario" value={sid} onChange={(e) => pick(e.target.value as ScenarioId)}
              className="min-h-11 w-full min-w-0 max-w-none rounded-lg border border-line bg-paper px-2.5 text-[13px] font-semibold text-ink min-[420px]:max-w-[380px] sm:px-3">
              {SCENARIOS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div className="max-[419px]:ml-auto"><ThemeButton /></div>
        </div>
      </header>

      {!split && (
        <div className="shrink-0 border-b border-line bg-paper px-4 pb-2 [@media(max-height:700px)]:pb-1.5">
          {narrator}
          <div role="tablist" aria-label="Choose a screen" className="mx-auto mt-2 grid max-w-[440px] grid-cols-3 gap-1 rounded-lg bg-aground p-1 [@media(max-height:700px)]:mt-1.5">
            {(["passenger", "admin", "driver"] as FrameKey[]).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} disabled={k === "driver" && !driverOn} data-testid={`tab-demo-${k}`} onClick={() => setTab(k)}
                className={cn("inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-2 text-[13px] font-bold capitalize disabled:cursor-not-allowed", tab === k ? "bg-paper text-ink shadow-e1" : "text-mute")}>
                {k === "driver" && !driverOn && <Lock size={12} aria-hidden />}{k}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col items-center px-3 py-2 sm:px-6 sm:py-3 xl:py-4">
        {/* message lane: kept clear so a notification never covers a frame */}
        <div className="flex w-full shrink-0 justify-end [@media(min-height:860px)]:xl:min-h-[76px]">
          {step.msg && (
            <div key={`${sid}-${i}`} data-testid="demo-toast" className="demo-toast mb-2 w-full max-w-[380px] rounded-xl border border-line bg-paper p-2.5 shadow-e2 [@media(max-height:700px)]:mb-1 [@media(max-height:700px)]:p-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-green"><MessageSquare size={13} />{step.msg.via} to {step.msg.to.split(" ")[0]}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-ink">{step.msg.text}</p>
            </div>
          )}
        </div>
        {stage}
      </main>

      <footer className="shrink-0 border-t border-line bg-paper">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-2 sm:px-6 xl:py-3 [@media(max-height:700px)]:py-1.5">
          <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
            {split && <div className="min-w-[min(100%,260px)] max-w-[520px] flex-1">{narrator}</div>}
            <div className={cn("flex w-full flex-wrap items-center gap-2", split ? "sm:w-auto" : "justify-center")}>
              <button type="button" data-testid="button-demo-back" aria-label="Previous step" disabled={i === 0} onClick={() => { setPlaying(false); go(i - 1); }}
                className="tap inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-line px-3 text-[13px] font-semibold disabled:opacity-40"><ChevronLeft size={16} /><span className="hidden sm:inline">Back</span></button>
              {!reduced && (
                <button type="button" data-testid="button-demo-play" onClick={() => { if (last) restart(); else setPlaying((p) => !p); }}
                  className="tap inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg bg-brand px-4 text-[13px] font-bold text-brand-ink">
                  {last ? <><RotateCcw size={15} /><span className="hidden sm:inline">Replay</span></> : playing ? <><Pause size={15} /><span className="hidden sm:inline">Pause</span></> : <><Play size={15} /><span className="hidden sm:inline">Play</span></>}
                </button>
              )}
              <button type="button" data-testid="button-demo-next" aria-label="Next step" disabled={last} onClick={() => { setPlaying(false); go(i + 1); }}
                className="tap inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-line px-3 text-[13px] font-semibold disabled:opacity-40"><span className="hidden sm:inline">Next</span><ChevronRight size={16} /></button>
              <button type="button" data-testid="button-demo-restart" onClick={restart} className="tap inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold"><RotateCcw size={15} /><span className="hidden sm:inline">Restart</span></button>
              <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
                <select aria-label="Skip to step" data-testid="select-demo-step" value={i} onChange={(e) => { setPlaying(false); go(Number(e.target.value)); }}
                  className="min-h-11 w-full min-w-0 max-w-none rounded-lg border border-line bg-paper px-2.5 text-[13px] font-semibold text-ink sm:max-w-[360px]">
                  {steps.map((x, n) => <option key={x.n} value={n}>{x.n}. {x.title}</option>)}
                </select>
                {!reduced && (
                  <div className="hidden shrink-0 items-center gap-1 rounded-lg bg-aground p-1 sm:inline-flex" role="group" aria-label="Speed">
                    {[0.75, 1, 1.5].map((v) => (
                      <button key={v} type="button" onClick={() => setSpeed(v)} aria-pressed={speed === v}
                        className={cn("tnum min-h-11 min-w-11 rounded-md px-2 text-[12px] font-bold sm:px-2.5", speed === v ? "bg-paper text-ink shadow-e1" : "text-mute")}>{v}x</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-0.5 hidden flex-wrap items-center gap-x-4 gap-y-1 sm:flex [@media(max-height:820px)]:sm:hidden">
            <div className="flex w-full items-center gap-1" role="group" aria-label={`Step ${step.n} of ${steps.length}`}>
              {steps.map((x, n) => stripClickable ? (
                <button key={x.n} type="button" aria-label={`Go to step ${x.n}: ${x.title}`} aria-current={n === i} onClick={() => { setPlaying(false); go(n); }} className="flex min-h-11 flex-1 items-center">
                  <span className={cn("h-1.5 w-full rounded-full", n <= i ? "bg-green" : "bg-line-strong")} />
                </button>
              ) : (
                <span key={x.n} className={cn("h-1.5 flex-1 rounded-full", n <= i ? "bg-green" : "bg-line-strong")} />
              ))}
            </div>
            <p className="text-[12px] text-mute">
              <span className="hidden sm:inline">{reduced ? "Reduced motion is on: steps advance only when you press Next. " : "Auto-play is on. Press any step, or Pause to take over. "}</span>
              <span className="inline-flex items-center gap-1"><Smartphone size={12} />Demo data only. <span className="hidden sm:inline">Driver photos are AI-generated sample imagery.</span><span className="sm:hidden">Sample photos.</span></span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
