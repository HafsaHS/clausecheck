import { Button } from "@/components/ui/button";

// Placeholder until the M1 landing page lands; uses the brand tokens so the scaffold already looks like ClauseCheck.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <span className="rounded-full border border-brass/40 px-3 py-1 text-xs font-medium tracking-wide text-brass">
        Demo build · synthetic data
      </span>
      <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Contract review AI that cites its sources
      </h1>
      <p className="max-w-xl text-muted-foreground">
        First-pass contract review in minutes, checked against your playbook, with a citation for every answer.
      </p>
      <Button size="lg" disabled>
        Try the demo · coming soon
      </Button>
    </main>
  );
}
