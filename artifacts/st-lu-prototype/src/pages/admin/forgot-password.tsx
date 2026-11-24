import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Btn, Logo, inputCls } from "@/components/kit";
import { toast } from "@/lib/store";

/* Page 24 */
export function AdminForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("samuel@stluciantaxiandtours.com");
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div className="grid min-h-[100dvh] md:grid-cols-2">
      <section className="flex flex-col bg-green p-8 text-white md:p-11">
        <Logo />
        <div className="my-auto py-12">
          <h1 className="text-[40px] font-bold leading-[1.08] md:text-[50px]">Dispatch every ride<br />from one screen.</h1>
          <p className="mt-4 max-w-[460px] text-[17px] text-white/90">Assign drivers, follow live trips, manage fixed prices and refunds for St. Lucia.</p>
        </div>
        <p className="text-[13px] text-white/85">Morne Fortune, Castries, St. Lucia</p>
      </section>
      <section className="flex items-center justify-center bg-aground p-8">
        <form className="w-full max-w-[400px]" onSubmit={(e) => { e.preventDefault(); if (!email.includes("@")) return toast("Enter your work email", "err"); setSent(email.trim()); }}>
          <h2 className="text-[28px] font-bold">Reset your password</h2>
          <p className="text-[14px] text-mute">Enter your work email and we send a reset link.</p>
          <label className="mt-6 block text-[13px] font-semibold text-mute">Email</label>
          <input data-testid="input-reset-email" aria-label="Email" autoComplete="username" type="email" className={inputCls + " mt-1"} value={email} onChange={(e) => setEmail(e.target.value)} />
          {sent && <p className="anim-rise mt-3 flex gap-2 rounded-xl bg-ok p-3 text-[14px] text-green" data-testid="text-reset-sent"><CheckCircle2 size={16} className="mt-0.5 shrink-0" />In the real app a reset link goes to {sent} and works for 30 minutes. Nothing is sent in this demo.</p>}
          <Btn type="submit" className="mt-4 w-full" data-testid="button-send-reset">Send reset link</Btn>
          <div className="mt-4 flex items-center justify-between text-[14px] font-semibold">
            <button type="button" data-testid="button-resend-reset" onClick={() => toast(`Reset link resent to ${email}`)} className="min-h-11 px-1 font-semibold text-green">Resend link</button>
            <button type="button" data-testid="link-back-to-signin" onClick={() => nav("/admin/login")} className="min-h-11 px-1 font-semibold text-green">Back to sign in</button>
          </div>
        </form>
      </section>
    </div>
  );
}
