import "server-only";
import { log } from "@/lib/log";
import { createAdminClient } from "@/lib/supabase/admin";

export const DEMO_ORG_NAME = "Whitlock & Rao LLP (demo)";

/**
 * Creates an org with the user as owner. Uses the service role because orgs have no insert
 * policy (spec §8); callers must have verified the user with their session client first.
 */
export async function createOrgForUser(userId: string, name: string, opts: { isDemoSandbox?: boolean } = {}) {
  const admin = createAdminClient();

  const { error: profileError } = await admin.from("profiles").upsert({ id: userId }, { ignoreDuplicates: true });
  if (profileError) throw profileError;

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name, is_demo_sandbox: opts.isDemoSandbox ?? false })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const { error: memberError } = await admin.from("memberships").insert({ org_id: org.id, user_id: userId, role: "owner" });
  if (memberError) {
    await admin.from("organizations").delete().eq("id", org.id);
    throw memberError;
  }

  await admin.from("audit_log").insert({ org_id: org.id, actor: userId, action: "org.create", entity: "organization", entity_id: org.id });
  log.info("org.created", { orgId: org.id, isDemoSandbox: opts.isDemoSandbox ?? false });
  return org.id;
}

/** The user's existing demo sandbox, so "Try the demo" stays idempotent. */
export async function findDemoSandbox(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("org_id, organizations!inner(is_demo_sandbox)")
    .eq("user_id", userId)
    .eq("organizations.is_demo_sandbox", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.org_id ?? null;
}
