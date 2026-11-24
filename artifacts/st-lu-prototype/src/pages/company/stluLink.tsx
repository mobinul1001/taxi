import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { AGENCY } from "./routes";

/** Where the St Lu case study lives on the agency site: the whole prototype, built as a static folder. */
export const STLU_BASE = "/st-lucia-taxi-app/";

/**
 * A link to the St Lu prototype. Inside the prototype build it is a normal router link. On the agency site the
 * prototype is a separate static build kept under /st-lucia-taxi-app/ (its own hash routes), so the link opens it
 * in a new tab: "/" is the prototype start page, "/landing" is the St Lu website.
 */
export function StluLink({ to, ...rest }: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return AGENCY
    ? <a href={to === "/" ? STLU_BASE : `${STLU_BASE}#${to}`} target="_blank" rel="noopener noreferrer" {...rest} />
    : <Link to={to} {...rest} />;
}
