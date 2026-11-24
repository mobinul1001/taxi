import { ROUTES } from "./routes";

/**
 * The one place an enquiry goes through, used by the contact page form and the "Get a Quote" dialog.
 * Submissions are posted to Formspree. The thank-you page only opens after submitEnquiry reports ok, and the page
 * itself refuses to show a confirmation to anyone who did not arrive that way.
 */
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjrpado";
export const DELIVERY_LIVE = true;

export type Enquiry = Record<string, string>;
export type SubmitResult = { ok: true } | { ok: false; error: string };

const FAIL = "We could not send your message. Please check your connection and try again.";

export async function submitEnquiry(data: Enquiry): Promise<SubmitResult> {
  const body: Enquiry = { ...data };
  if (!body.message && body.notes) body.message = body.notes; // the quote dialog calls it "notes"
  delete body.notes;
  body._subject = body._subject || "New enquiry from TaxiAppDevelopment.org";
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const j = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null;
    const msg = j?.errors?.map((e) => e.message).filter(Boolean).join(" ");
    return { ok: false, error: msg || FAIL };
  } catch {
    return { ok: false, error: FAIL };
  }
}

/** Router state that marks a visit to the thank-you page as coming from a successful submission. */
export const thanksState = (kind?: string) => ({ submitted: true, kind: kind ?? "" });
export const THANKS_PATH = ROUTES.thankYou;
