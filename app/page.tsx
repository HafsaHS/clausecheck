import { BookOpenCheckIcon, PenLineIcon, QuoteIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { startDemo } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { DisclaimerFooter } from "@/components/disclaimer";
import { EvalStrip } from "@/components/landing/eval-strip";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth/session";

const FEATURES = [
  {
    icon: BookOpenCheckIcon,
    title: "Scored against your playbook",
    body: "Every clause is pulled out, classified and rated preferred, fallback or unacceptable against your firm's own positions. Missing protections are flagged too.",
  },
  {
    icon: PenLineIcon,
    title: "Redlines an attorney signs off",
    body: "Suggested edits show as a word-level diff. Reviewers propose, and only attorneys can accept. Memos stay marked draft until sign-off.",
  },
  {
    icon: QuoteIcon,
    title: "Answers with a citation for every claim",
    body: "Ask about the contract and every sentence cites its section and page. When the contract is silent, it says so instead of guessing.",
  },
];

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const demoUnavailable = params.demo === "unavailable";

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/app">Open app</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col gap-20 pb-20">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-16 text-center sm:pt-24">
          <span className="rounded-full border border-brass/40 px-3 py-1 text-xs font-medium tracking-wide text-brass">
            Demo build · synthetic data
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Contract review AI that cites its sources
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            First-pass contract review in minutes, checked against your playbook, with a citation for every answer.
          </p>
          {demoUnavailable && (
            <p role="alert" className="rounded-md bg-risk-medium-bg px-3 py-2 text-sm text-risk-medium">
              The demo couldn&apos;t start just now. Please try again in a minute.
            </p>
          )}
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            {user ? (
              <Button asChild size="lg">
                <Link href="/app">Open your workspace</Link>
              </Button>
            ) : (
              <form action={startDemo}>
                <SubmitButton size="lg" pendingLabel="Preparing your sandbox…">
                  Try the demo, no sign-up
                </SubmitButton>
              </form>
            )}
            {!user && (
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in with email</Link>
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            The sandbox is yours for 24 hours. Sample contracts are fictional.
          </p>
        </section>

        <Suspense fallback={null}>
          <EvalStrip />
        </Suspense>

        <section aria-labelledby="features" className="mx-auto w-full max-w-5xl px-4">
          <h2 id="features" className="sr-only">
            What it does
          </h2>
          <ul className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-xl border bg-card p-6">
                <span className="mb-4 grid size-10 place-items-center rounded-lg bg-accent text-brass">
                  <f.icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <DisclaimerFooter />
    </div>
  );
}
