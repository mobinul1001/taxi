import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Btn } from "./kit";
import { setSession } from "@/lib/store";

/** Page 9: log out confirm sheet, shared by passenger Account and driver Profile. */
export function LogoutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  if (!open) return null;
  const root = document.getElementById("phone-root");
  const sheet = (
    <div className="anim-fade absolute inset-0 z-[60] flex items-end bg-ink/45" onClick={onClose} data-testid="sheet-logout">
      <div onClick={(e) => e.stopPropagation()} className="anim-sheet w-full rounded-t-2xl bg-ground px-5 pb-8 pt-3">
        <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-line-strong" />
        <h2 className="font-display text-[24px] font-bold">Log out?</h2>
        <p className="mt-2 text-[16px] text-mute">Your trips and alerts stay safe. You will need your email and password to log back in.</p>
        <Btn variant="danger" className="mt-5 min-h-[52px] w-full text-[16px]" data-testid="button-confirm-logout" onClick={() => { setSession(null); onClose(); nav("/app/welcome"); }}>Log out</Btn>
        <Btn variant="outline" className="mt-2 min-h-[52px] w-full text-[16px]" data-testid="button-stay-logged-in" onClick={onClose}>Stay logged in</Btn>
      </div>
    </div>
  );
  return root ? createPortal(sheet, root) : sheet;
}
