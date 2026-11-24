import type { AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { SITE_ORIGIN } from "@/lib/config";
import { AGENCY } from "./routes";

/**
 * A link to the St Lu prototype. Inside the prototype build it is a normal router link; on the agency site
 * (which does not contain the prototype) it is an ordinary link to the prototype's own address.
 */
export function StluLink({ to, ...rest }: { to: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return AGENCY
    ? <a href={`${SITE_ORIGIN}${to === "/" ? "/" : to}`} rel="noopener" {...rest} />
    : <Link to={to} {...rest} />;
}
