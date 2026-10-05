import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { startDemo } from "@/app/actions/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { DisclaimerFooter } from "@/components/disclaimer";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { safeNextPath } from "@/lib/auth/active-org";
import { getUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const linkFailed = params.error === "link";

  const user = await getUser();
  if (user && !user.is_anonymous) redirect(next);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-4 py-5 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-16 sm:pt-20">
        <div className="w-full max-w-sm space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Sign in to ClauseCheck</CardTitle>
              <CardDescription>We&apos;ll email you a one-time link. No password needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkFailed && (
                <p role="alert" className="rounded-md bg-risk-high-bg px-3 py-2 text-sm text-risk-high">
                  That sign-in link has expired or was already used. Request a new one below.
                </p>
              )}
              <LoginForm next={next} />
            </CardContent>
          </Card>
          <form action={startDemo} className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Just looking around?</p>
            <SubmitButton variant="outline" pendingLabel="Preparing your sandbox…">
              Try the demo, no sign-up
            </SubmitButton>
          </form>
        </div>
      </main>
      <DisclaimerFooter />
    </div>
  );
}
