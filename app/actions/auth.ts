"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ACTIVE_ORG_COOKIE, safeNextPath } from "@/lib/auth/active-org";
import { setActiveOrgCookie } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { createOrgForUser, DEMO_ORG_NAME, findDemoSandbox } from "@/lib/orgs";
import { createClient } from "@/lib/supabase/server";

export type MagicLinkState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const emailSchema = z.email("Enter a valid email address.");

export async function sendMagicLink(_prev: MagicLinkState, formData: FormData): Promise<MagicLinkState> {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim());
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const next = safeNextPath(String(formData.get("next") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${env().NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    log.warn("auth.magic_link_failed", { code: error.code, status: error.status });
    const message =
      error.status === 429
        ? "Too many sign-in emails were sent recently. Wait a few minutes and try again."
        : "We couldn't send the sign-in link. Try again in a moment.";
    return { status: "error", message, email: parsed.data };
  }
  return { status: "sent", email: parsed.data };
}

/** "Try the demo": anonymous sign-in plus a personal sandbox org. Safe to call repeatedly. */
export async function startDemo() {
  const supabase = await createClient();
  let user = (await supabase.auth.getUser()).data.user;

  // A real signed-in user already has the app; no sandbox needed.
  if (user && !user.is_anonymous) redirect("/app");

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      log.error("demo.anon_signin_failed", { code: error?.code, status: error?.status });
      redirect("/?demo=unavailable");
    }
    user = data.user;
  }

  let orgId: string;
  try {
    orgId = (await findDemoSandbox(user.id)) ?? (await createOrgForUser(user.id, DEMO_ORG_NAME, { isDemoSandbox: true }));
  } catch (err) {
    log.error("demo.sandbox_failed", { error: err instanceof Error ? err.message : String(err) });
    redirect("/?demo=unavailable");
  }

  await setActiveOrgCookie(orgId);
  redirect("/app/contracts");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(ACTIVE_ORG_COOKIE);
  redirect("/");
}
