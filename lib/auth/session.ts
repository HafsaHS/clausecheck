import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { ACTIVE_ORG_COOKIE, pickActiveOrg, type Membership } from "@/lib/auth/active-org";
import { createClient } from "@/lib/supabase/server";

/** The signed-in user, verified with the Auth server (deduped per request). */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

/** The user's org memberships, read through RLS. */
export const getMemberships = cache(async (userId: string): Promise<Membership[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("role, org_id, organizations(name, is_demo_sandbox)")
    .eq("user_id", userId)
    .order("created_at");
  if (error) throw error;
  return data.flatMap((m) =>
    m.organizations
      ? [{ orgId: m.org_id, role: m.role, orgName: m.organizations.name, isDemoSandbox: m.organizations.is_demo_sandbox }]
      : [],
  );
});

export const getActiveOrg = cache(async (userId: string) => {
  const memberships = await getMemberships(userId);
  const cookieOrgId = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
  return { memberships, active: pickActiveOrg(memberships, cookieOrgId) };
});

export async function setActiveOrgCookie(orgId: string) {
  (await cookies()).set(ACTIVE_ORG_COOKIE, orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
