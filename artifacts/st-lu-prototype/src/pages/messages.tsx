import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/kit";
import { useAppState } from "@/lib/store";

const SAMPLE: Record<string, string> = {
  "{passenger}": "Maria", "{ref}": "SLU-48213", "{service}": "Airport Transfer", "{date}": "Mon 14 Dec", "{time}": "14:30", "{pickup}": "Hewanorra Airport (UVF)",
  "{dropoff}": "Rodney Bay", "{driver}": "Marcus Joseph", "{vehicle}": "Toyota Noah, white", "{plate}": "VF 4471", "{amount}": "$94.25", "{payout}": "$64.00",
  "{link}": "stlu.co/j/48213", "{flight}": "BA 2155", "{status}": "on the way", "{document}": "insurance", "{expiry}": "7 Jan 2027",
};
const fill = (t: string) => t.replace(/\{\w+\}/g, (m) => SAMPLE[m] ?? m);
const GROUPS = ["Passenger", "In-house driver", "Outside driver", "Dispatcher", "Admin"];

export default function Messages() {
  const s = useAppState();
  return (
    <div className="bar-clear min-h-[100dvh] bg-ground">
      <header className="on-dark bg-green-night text-white"><div className="mx-auto flex min-h-16 w-full max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2 sm:px-8 lg:px-10"><Link to="/" aria-label="Back" className="tap inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20"><ArrowLeft size={18} /></Link><Logo size="sm" /><h1 className="font-display text-[20px] font-bold">Message previews</h1></div></header>
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">
        <p className="max-w-[640px] text-mute">Every alert is sent by SMS and WhatsApp and shown in-app. Templates are edited in Admin, Settings. No real messages are sent in this prototype.</p>
        {GROUPS.map((g) => (
          <section key={g} className="mt-8">
            <h2 className="font-display text-[22px] font-bold">{g}</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {s.settings.templates.filter((t) => t.group === g).map((t) => (
                <div key={t.id} className="rounded-xl border border-line bg-paper p-4 shadow-card">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-3 text-[12px] font-bold tracking-widest text-mute">SMS</p>
                  <div className="mt-1 max-w-[90%] rounded-xl rounded-bl-[4px] bg-neutral px-3.5 py-2.5 text-[14px]">{fill(t.sms)}</div>
                  <p className="mt-3 text-right text-[12px] font-bold tracking-widest text-mute">WHATSAPP</p>
                  <div className="ml-auto mt-1 max-w-[90%] rounded-xl rounded-br-[4px] bg-[#D9F5CF] px-3.5 py-2.5 text-[14px] text-[#0F1F18]">{fill(t.whatsapp)}<span className="mt-1 block text-right text-[12px] text-[#4A5A50]">14:21</span></div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
