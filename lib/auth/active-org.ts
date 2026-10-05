import type { Database } from "@/lib/supabase/database.types";

export type OrgRole = Database["public"]["Enums"]["org_role"];

export type Membership = {
  orgId: string;
  orgName: string;
  role: OrgRole;
  isDemoSandbox: boolean;
};

export const ACTIVE_ORG_COOKIE = "cc_org";

/** The org named by the cookie if the user still belongs to it, otherwise their first org. */
export function pickActiveOrg(memberships: Membership[], cookieOrgId: string | undefined): Membership | null {
  return memberships.find((m) => m.orgId === cookieOrgId) ?? memberships[0] ?? null;
}

/** Only same-site relative paths are allowed as post-login destinations (no open redirects). */
export function safeNextPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
