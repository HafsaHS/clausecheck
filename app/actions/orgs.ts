"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getMemberships, getUser, setActiveOrgCookie } from "@/lib/auth/session";
import { log } from "@/lib/log";
import { createOrgForUser } from "@/lib/orgs";

export type CreateOrgState = { message?: string };

const orgNameSchema = z
  .string()
  .trim()
  .min(2, "Use at least 2 characters.")
  .max(80, "Keep it under 80 characters.");

export async function createOrg(_prev: CreateOrgState, formData: FormData): Promise<CreateOrgState> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.is_anonymous) return { message: "Demo visitors can't create workspaces. Sign in with your email first." };

  const parsed = orgNameSchema.safeParse(formData.get("name") ?? "");
  if (!parsed.success) return { message: parsed.error.issues[0].message };

  let orgId: string;
  try {
    orgId = await createOrgForUser(user.id, parsed.data);
  } catch (err) {
    log.error("org.create_failed", { error: err instanceof Error ? err.message : String(err) });
    return { message: "We couldn't create the workspace. Try again." };
  }

  await setActiveOrgCookie(orgId);
  redirect("/app/contracts");
}

export async function switchOrg(orgId: string) {
  const user = await getUser();
  if (!user) redirect("/login");

  const memberships = await getMemberships(user.id);
  // Only orgs the user belongs to (read through RLS) can become active.
  if (memberships.some((m) => m.orgId === orgId)) await setActiveOrgCookie(orgId);
  redirect("/app/contracts");
}
