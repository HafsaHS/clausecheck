import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut, startDemo } from "@/app/actions/auth";
import { AppSidebar } from "@/components/app/app-sidebar";
import { CreateOrgForm } from "@/components/app/create-org-form";
import { Logo } from "@/components/brand/logo";
import { DisclaimerFooter } from "@/components/disclaimer";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getActiveOrg, getUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await getUser();
  if (!user) redirect("/login?next=/app");

  const { memberships, active } = await getActiveOrg(user.id);
  if (!active) return <NoWorkspace isAnonymous={Boolean(user.is_anonymous)} />;

  const sidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";
  const userLabel = user.is_anonymous ? "Demo visitor" : (user.email ?? "Signed in");

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar memberships={memberships} active={active} userLabel={userLabel} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <span className="truncate text-sm text-muted-foreground">{active.orgName}</span>
          {active.isDemoSandbox && (
            <Badge variant="outline" className="ml-auto border-brass/40 text-brass">
              Demo · synthetic data
            </Badge>
          )}
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        <DisclaimerFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

function NoWorkspace({ isAnonymous }: { isAnonymous: boolean }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <form action={signOut}>
          <SubmitButton variant="ghost" size="sm">
            Sign out
          </SubmitButton>
        </form>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-16 sm:pt-20">
        <Card className="w-full max-w-sm">
          {isAnonymous ? (
            <>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Your demo sandbox expired</CardTitle>
                <CardDescription>Sandboxes are cleared after 24 hours. Start a fresh one in a second.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={startDemo}>
                  <SubmitButton className="w-full" pendingLabel="Preparing your sandbox…">
                    Start a new demo
                  </SubmitButton>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Create your workspace</CardTitle>
                <CardDescription>A workspace holds your firm&apos;s contracts, playbooks and team. You&apos;ll be its owner.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateOrgForm />
              </CardContent>
            </>
          )}
        </Card>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
