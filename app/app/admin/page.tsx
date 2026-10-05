import { ShieldIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState, PageHeader } from "@/components/app/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveOrg, getUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin" };

const dateFmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/app/admin");
  const { active } = await getActiveOrg(user.id);
  if (!active) redirect("/app");

  if (active.role !== "owner") {
    return (
      <div className="mx-auto max-w-6xl">
        <EmptyState icon={ShieldIcon} title="Owners only">
          Only workspace owners can manage members and view usage and the audit log.
        </EmptyState>
      </div>
    );
  }

  const supabase = await createClient();
  const [members, audit] = await Promise.all([
    supabase.from("memberships").select("user_id, role, created_at").eq("org_id", active.orgId).order("created_at"),
    supabase
      .from("audit_log")
      .select("id, action, entity, created_at")
      .eq("org_id", active.orgId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Admin" description={`Members, usage and audit trail for ${active.orgName}.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Roles decide who can accept redlines and sign off reviews.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {(members.data ?? []).map((m) => (
                <li key={m.user_id} className="flex items-center justify-between py-2">
                  <span>{m.user_id === user.id ? "You" : `Member ${m.user_id.slice(0, 8)}`}</span>
                  <Badge variant="secondary" className="capitalize">
                    {m.role}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Latest 20 events. Times in UTC.</CardDescription>
          </CardHeader>
          <CardContent>
            {audit.data?.length ? (
              <ul className="divide-y text-sm">
                {audit.data.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-4 py-2">
                    <code className="font-mono text-xs">{e.action}</code>
                    <time className="text-xs text-muted-foreground" dateTime={e.created_at}>
                      {dateFmt.format(new Date(e.created_at))}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
